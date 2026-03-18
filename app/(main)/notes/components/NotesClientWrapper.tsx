"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Folder, LucideIcon, Hash } from "lucide-react";
import NotesSidebar from "./NotesSidebar";
import NotesContentPanel from "./NotesContentPanel";
import NoteDetailPanel from "./NoteDetailPanel";
import WorkspaceDashboard from "./WorkspaceDashboard";
import FolderDashboard from "./FolderDashboard";
import { NoteService, ApiFolder, ApiWorkspace, ApiNote } from "../services/note-service";
import { getIconByName, getIconName } from "../utils/icon-utils";
import { useMediaQuery } from "@/lib/utils";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";

export type NoteItem = {
  id: string;
  workspace_id?: string;
  title: string;
  desc: string;
  time: string;
  content?: unknown;
  highlight?: boolean;
  location?: string;
};

export default function NotesClientWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- 1. SOURCE OF TRUTH (URL) ---
  const activeFolderId = searchParams.get("folder");
  const activeWorkspaceId = searchParams.get("workspace") || "";
  const activeNoteId = searchParams.get("note");

  // --- 2. DATA STATE ---
  const [folders, setFolders] = useState<{ id: string; name: string; icon: LucideIcon }[]>([]);
  const [workspaceIcons, setWorkspaceIcons] = useState<Record<string, LucideIcon>>({});
  const [workspaceNames, setWorkspaceNames] = useState<Record<string, string>>({});
  const [notesData, setNotesData] = useState<Record<string, Record<string, NoteItem[]>>>({});
  const [loading, setLoading] = useState(true);
  
  const [noteDetailsCache, setNoteDetailsCache] = useState<Record<string, NoteItem>>({});

  const isMobile = useMediaQuery("(max-width: 768px)");

  // --- HELPER: Media URL Normalization ---
  const normalizeMediaUrls = useCallback((html: string): string => {
    if (!html) return "";
    return html.replace(/src="\/uploads\//g, 'src="https://s3.ahmakbar.space/uploads/');
  }, []);

  // --- HELPER: Content Processing ---
  const extractContentHtml = useCallback((content: unknown, plainTextFallback: string = ""): string => {
    if (!content) return "";
    let html = "";
    if (typeof content === "string") {
      html = content;
    } else if (typeof content === "object" && content !== null) {
      const c = content as { html?: string; type?: string };
      if (c.html) html = c.html;
      else if (c.type === "doc") html = plainTextFallback;
    }
    return normalizeMediaUrls(html);
  }, [normalizeMediaUrls]);

  const stripHtml = useCallback((html: string): string => {
    if (!html) return "- ";
    const stripped = html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
    return stripped || "- ";
  }, []);

  // --- 3. DERIVED DATA (Memoized) ---
  const activeFolderName = useMemo(() => 
    folders.find(f => f.id === activeFolderId)?.name || null,
  [folders, activeFolderId]);

  const activeWorkspaceName = useMemo(() => 
    activeWorkspaceId ? workspaceNames[activeWorkspaceId] || "" : "",
  [workspaceNames, activeWorkspaceId]);

  const currentWorkspaces = useMemo(() => {
    if (!activeFolderId || !notesData[activeFolderId]) return [];
    return Object.keys(notesData[activeFolderId]).map(id => ({
      id,
      name: workspaceNames[id] || "Untitled Workspace",
      icon: workspaceIcons[id] || Hash
    }));
  }, [activeFolderId, notesData, workspaceNames, workspaceIcons]);

  const currentNotes = useMemo(() => {
    if (!activeFolderId || !activeWorkspaceId) return [];
    return notesData[activeFolderId]?.[activeWorkspaceId] || [];
  }, [activeFolderId, activeWorkspaceId, notesData]);

  const selectedNote = useMemo(() => {
    if (!activeNoteId) return null;
    if (noteDetailsCache[activeNoteId]) return noteDetailsCache[activeNoteId];
    return currentNotes.find(n => n.id === activeNoteId) || null;
  }, [activeNoteId, noteDetailsCache, currentNotes]);

  const isDetailOpen = !!activeNoteId;

  // --- 4. NAVIGATION LOGIC (Unified) ---
  const navigateTo = useCallback((params: { folder?: string | null, workspace?: string | null, note?: string | null }, replace = false) => {
    const newParams = new URLSearchParams(searchParams.toString());
    const oldParams = {
      folder: searchParams.get("folder"),
      workspace: searchParams.get("workspace"),
      note: searchParams.get("note")
    };
    
    if (params.folder !== undefined) {
      if (params.folder) newParams.set("folder", params.folder);
      else newParams.delete("folder");
    }
    if (params.workspace !== undefined) {
      if (params.workspace) newParams.set("workspace", params.workspace);
      else newParams.delete("workspace");
    }
    if (params.note !== undefined) {
      if (params.note) newParams.set("note", params.note);
      else newParams.delete("note");
    }

    const target = `${pathname}?${newParams.toString()}`;
    
    // Logic push vs replace untuk back button yang seamless di mobile
    const isDeeper = 
      (!oldParams.folder && params.folder) || 
      (oldParams.folder && !oldParams.workspace && params.workspace) ||
      (oldParams.workspace && !oldParams.note && params.note);

    if (isDeeper && isMobile && !replace) {
      router.push(target);
    } else {
      router.replace(target);
    }
  }, [pathname, router, searchParams, isMobile]);

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NoteService.getAll();
      if (!Array.isArray(data)) {
        setFolders([]);
        return;
      }
      
      const formattedFolders = data.map(f => ({
        id: f.id,
        name: f.name,
        icon: f.icon_name ? getIconByName(f.icon_name) : Folder
      }));
      setFolders(formattedFolders);

      const newNotesData: Record<string, Record<string, NoteItem[]>> = {};
      const newWorkspaceNames: Record<string, string> = {};
      const newWorkspaceIcons: Record<string, LucideIcon> = {};

      data.forEach((folder: ApiFolder) => {
        newNotesData[folder.id] = {};
        folder.workspaces.forEach((ws: ApiWorkspace) => {
          newWorkspaceNames[ws.id] = ws.name;
          if (ws.icon_name) {
            newWorkspaceIcons[ws.id] = getIconByName(ws.icon_name);
          }
          newNotesData[folder.id][ws.id] = ws.notes.map((note: ApiNote) => ({
            id: note.id || crypto.randomUUID(),
            workspace_id: note.workspace_id,
            title: note.title,
            desc: note.plain_text_preview || "- ",
            time: new Date(note.updated_at).toLocaleDateString(),
            content: extractContentHtml(note.content, note.plain_text_preview),
            highlight: note.highlight
          }));
        });
      });
      setNotesData(newNotesData);
      setWorkspaceNames(newWorkspaceNames);
      setWorkspaceIcons(newWorkspaceIcons);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  }, [extractContentHtml]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch detail note jika ID berubah
  useEffect(() => {
    if (!activeNoteId || noteDetailsCache[activeNoteId]) return;
    const fetchDetail = async () => {
      try {
        const fullNote = await NoteService.getById(activeNoteId);
        const detailedNote: NoteItem = {
          id: fullNote.id,
          workspace_id: fullNote.workspace_id,
          title: fullNote.title,
          desc: fullNote.plain_text_preview || "- ",
          time: new Date(fullNote.updated_at).toLocaleDateString(),
          content: extractContentHtml(fullNote.content, fullNote.plain_text_preview),
          highlight: fullNote.highlight
        };
        setNoteDetailsCache(prev => ({ ...prev, [activeNoteId]: detailedNote }));
      } catch (e) {
        console.error("Failed to fetch note detail", e);
      }
    };
    fetchDetail();
  }, [activeNoteId, noteDetailsCache, extractContentHtml]);

  // --- CRUD HANDLERS (Updated to sync with notesData) ---
  const createNote = useCallback(async () => {
    if (!activeWorkspaceId || !activeFolderId) return;
    try {
      const newNoteApi = await NoteService.createNote(activeWorkspaceId, "Untitled Note");
      const newNote: NoteItem = {
        id: newNoteApi.id,
        workspace_id: newNoteApi.workspace_id,
        title: newNoteApi.title,
        desc: "- ",
        time: "now",
        content: extractContentHtml(newNoteApi.content)
      };
      setNotesData(prev => ({
        ...prev,
        [activeFolderId]: {
          ...prev[activeFolderId],
          [activeWorkspaceId]: [newNote, ...(prev[activeFolderId]?.[activeWorkspaceId] || [])]
        }
      }));
      navigateTo({ note: newNote.id });
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }, [activeFolderId, activeWorkspaceId, extractContentHtml, navigateTo]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await NoteService.deleteNote(noteId);
      setNotesData(prev => {
        if (!activeFolderId || !activeWorkspaceId) return prev;
        const wsNotes = prev[activeFolderId][activeWorkspaceId] || [];
        return {
          ...prev,
          [activeFolderId]: {
            ...prev[activeFolderId],
            [activeWorkspaceId]: wsNotes.filter(n => n.id !== noteId)
          }
        };
      });
      if (activeNoteId === noteId) navigateTo({ note: null }, true);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }, [activeFolderId, activeWorkspaceId, activeNoteId, navigateTo]);

  const duplicateNote = useCallback(async (note: NoteItem) => {
    if (!activeWorkspaceId || !activeFolderId) return;
    try {
      const newNoteApi = await NoteService.duplicateNote(note.id);
      const copy: NoteItem = {
        id: newNoteApi.id,
        workspace_id: newNoteApi.workspace_id,
        title: newNoteApi.title,
        desc: newNoteApi.plain_text_preview || "- ",
        time: "now",
        content: extractContentHtml(newNoteApi.content, newNoteApi.plain_text_preview)
      };
      setNotesData(prev => ({
        ...prev,
        [activeFolderId]: {
          ...prev[activeFolderId],
          [activeWorkspaceId]: [copy, ...(prev[activeFolderId]?.[activeWorkspaceId] || [])]
        }
      }));
    } catch (error) {
      console.error("Failed to duplicate note:", error);
    }
  }, [activeFolderId, activeWorkspaceId, extractContentHtml]);

  const updateNote = useCallback(async (updated: NoteItem): Promise<void> => {
    try {
      const htmlContent = typeof updated.content === "string" ? updated.content : "";
      const previewText = stripHtml(htmlContent);
      const payload = {
        title: updated.title,
        content: { html: htmlContent },
        plain_text_preview: previewText
      };
      const updatedApi = await NoteService.updateNote(updated.id, payload);
      
      const refreshedNote = {
        ...updated,
        desc: updatedApi.plain_text_preview || previewText,
        time: new Date(updatedApi.updated_at).toLocaleDateString()
      };

      setNotesData(prev => {
        if (!activeFolderId || !activeWorkspaceId) return prev;
        return {
          ...prev,
          [activeFolderId]: {
            ...prev[activeFolderId],
            [activeWorkspaceId]: prev[activeFolderId][activeWorkspaceId].map(n =>
              n.id === updated.id ? refreshedNote : n
            )
          }
        };
      });

      // Update cache
      setNoteDetailsCache(prev => ({ ...prev, [updated.id]: refreshedNote }));
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  }, [activeFolderId, activeWorkspaceId, stripHtml]);

  const handleReorderNotes = useCallback((newNotes: NoteItem[]) => {
    if (!activeFolderId || !activeWorkspaceId) return;
    setNotesData(prev => ({
      ...prev,
      [activeFolderId]: {
        ...prev[activeFolderId],
        [activeWorkspaceId]: newNotes,
      },
    }));
  }, [activeFolderId, activeWorkspaceId]);

  const handleCreateFolder = useCallback(async (name: string) => {
    try {
      const newF = await NoteService.createFolder(name);
      setFolders(prev => [...prev, { 
        id: newF.id, name: newF.name, 
        icon: newF.icon_name ? getIconByName(newF.icon_name) : Folder 
      }]);
      setNotesData(prev => ({ ...prev, [newF.id]: {} }));
      navigateTo({ folder: newF.id, workspace: "", note: null });
    } catch (e) { console.error(e); }
  }, [navigateTo]);

  const handleRenameFolder = useCallback(async (id: string, name: string) => {
    try {
      const folder = folders.find(f => f.id === id);
      await NoteService.updateFolder(id, name, folder?.icon ? getIconName(folder.icon) : undefined);
      setFolders(prev => prev.map(f => f.id === id ? { ...f, name } : f));
    } catch (e) { console.error(e); }
  }, [folders]);

  const handleDeleteFolder = useCallback(async (id: string) => {
    try {
      await NoteService.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
      if (activeFolderId === id) navigateTo({ folder: null, workspace: null, note: null }, true);
    } catch (e) { console.error(e); }
  }, [activeFolderId, navigateTo]);

  const handleCreateWorkspace = useCallback(async (name: string, icon: LucideIcon) => {
    if (!activeFolderId) return;
    try {
      const iconName = getIconName(icon);
      const newWs = await NoteService.createWorkspace(activeFolderId, name, iconName);
      setWorkspaceNames(prev => ({ ...prev, [newWs.id]: name }));
      setWorkspaceIcons(prev => ({ ...prev, [newWs.id]: icon }));
      setNotesData(prev => ({
        ...prev,
        [activeFolderId]: { ...prev[activeFolderId], [newWs.id]: [] }
      }));
      navigateTo({ workspace: newWs.id, note: null });
    } catch (e) { console.error(e); }
  }, [activeFolderId, navigateTo]);

  const handleRenameWorkspace = useCallback(async (id: string, name: string) => {
    try {
      const icon = workspaceIcons[id];
      await NoteService.updateWorkspace(id, name, icon ? getIconName(icon) : undefined);
      setWorkspaceNames(prev => ({ ...prev, [id]: name }));
    } catch (e) { console.error(e); }
  }, [workspaceIcons]);

  const handleDeleteWorkspace = useCallback(async (id: string) => {
    try {
      await NoteService.deleteWorkspace(id);
      setNotesData(prev => {
        if (!activeFolderId) return prev;
        const newWsData = { ...prev[activeFolderId] };
        delete newWsData[id];
        return { ...prev, [activeFolderId]: newWsData };
      });
      if (activeWorkspaceId === id) navigateTo({ workspace: null, note: null }, true);
    } catch (e) { console.error(e); }
  }, [activeFolderId, activeWorkspaceId, navigateTo]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-white">
      {!isMobile && (
        <NotesSidebar
          folders={folders}
          activeFolderId={activeFolderId}
          activeWorkspaceId={activeWorkspaceId}
          workspaces={currentWorkspaces}
          customIcons={workspaceIcons}
          onFolderSelect={(id) => navigateTo({ folder: id, workspace: "", note: null })}
          onWorkspaceSelect={(id) => navigateTo({ workspace: id, note: null })}
          onCreateFolder={handleCreateFolder}
          onCreateWorkspace={handleCreateWorkspace}
          onRenameWorkspace={handleRenameWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
        />
      )}

      <main className="flex-1 h-full overflow-hidden flex min-w-0 relative">
        {loading && folders.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30 animate-pulse">
             <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-400">Syncing notes...</span>
             </div>
          </div>
        ) : (
          <>
            {!activeFolderId && (
              <FolderDashboard
                folders={folders}
                onSelect={(id) => navigateTo({ folder: id, workspace: "", note: null })}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onCreateFolder={handleCreateFolder}
              />
            )}
            
            {activeFolderId && activeWorkspaceId === "" && (
              <WorkspaceDashboard
                workspaces={currentWorkspaces}
                onSelect={(id) => navigateTo({ workspace: id, note: null })}
                onRenameWorkspace={handleRenameWorkspace}
                onDeleteWorkspace={handleDeleteWorkspace}
                onBack={() => navigateTo({ folder: null, workspace: null, note: null })}
                onCreateWorkspace={handleCreateWorkspace}
              />
            )}

            {activeWorkspaceId !== "" && (!isMobile || !selectedNote) && (
              <NotesContentPanel
                folder={activeFolderName!}
                workspace={activeWorkspaceName}
                workspaceId={activeWorkspaceId}
                notes={currentNotes}
                createNote={createNote}
                duplicateNote={duplicateNote}
                deleteNote={deleteNote}
                onNoteClick={(n) => navigateTo({ note: n.id })}
                isDetailOpen={isDetailOpen}
                activeNoteId={activeNoteId}
                onBack={() => navigateTo({ workspace: null, note: null })}
                onRenameWorkspace={handleRenameWorkspace}
                onReorderNotes={handleReorderNotes}
                isMobile={isMobile}
              />
            )}
          </>
        )}

        <AnimatePresence mode="popLayout">
          {selectedNote && (
            <NoteDetailPanel
              key="detail-panel"
              note={selectedNote}
              onClose={() => navigateTo({ note: null })}
              onDelete={deleteNote}
              onUpdate={updateNote}
              onCreateNew={createNote}
              isMobile={isMobile}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
