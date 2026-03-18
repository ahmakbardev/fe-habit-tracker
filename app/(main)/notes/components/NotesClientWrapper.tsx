"use client";

import { useState, useEffect, useCallback } from "react";
// 1. Tambahkan import LucideIcon
import { Folder, LucideIcon, Hash } from "lucide-react";
import NotesSidebar from "./NotesSidebar";
import NotesContentPanel from "./NotesContentPanel";
import NoteDetailPanel from "./NoteDetailPanel";
import WorkspaceDashboard from "./WorkspaceDashboard";
import FolderDashboard from "./FolderDashboard";
import { NoteService, ApiFolder, ApiWorkspace, ApiNote } from "../services/note-service";
import { getIconByName, getIconName } from "../utils/icon-utils";

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

import { AnimatePresence } from "framer-motion";

export default function NotesClientWrapper() {
  // --- STATE ---
  const [folders, setFolders] = useState<{ id: string; name: string; icon: LucideIcon }[]>([]);
  const [workspaceIcons, setWorkspaceIcons] = useState<Record<string, LucideIcon>>({});
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [notesData, setNotesData] = useState<Record<string, Record<string, NoteItem[]>>>({});
  const [loading, setLoading] = useState(true);

  const isDetailOpen = selectedNote !== null;

  const [workspaceNames, setWorkspaceNames] = useState<Record<string, string>>({});

  // --- HELPER: Media URL Normalization ---
  const normalizeMediaUrls = useCallback((html: string): string => {
    if (!html) return "";
    // Temukan src="/uploads/..." dan ganti dengan https://s3.ahmakbar.space/uploads/...
    // Regex ini menangkap src yang dimulai dengan /uploads/
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
      else if (c.type === "doc") html = plainTextFallback; // Tiptap JSON fallback
    }
    
    return normalizeMediaUrls(html);
  }, [normalizeMediaUrls]);

  const stripHtml = useCallback((html: string): string => {
    if (!html) return "- ";
    const stripped = html
      .replace(/<[^>]*>?/gm, " ") // Hapus semua tag HTML
      .replace(/\s+/g, " ")       // Satukan spasi berlebih
      .trim();
    
    return stripped || "- "; // Jika kosong setelah di-strip, kirim placeholder
  }, []);

  // --- FETCH DATA ---
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await NoteService.getAll();
      
      const data = response;

      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
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

  // --- HELPER GETTERS ---
  const getActiveFolderName = () => {
    return folders.find(f => f.id === activeFolderId)?.name || null;
  };

  const getActiveWorkspaceName = () => {
    return activeWorkspaceId ? workspaceNames[activeWorkspaceId] || "" : "";
  };

  const getCurrentWorkspaces = () => {
    if (!activeFolderId || !notesData[activeFolderId]) return [];
    return Object.keys(notesData[activeFolderId]).map(id => ({
      id,
      name: workspaceNames[id] || "Untitled Workspace",
      icon: workspaceIcons[id] || Hash
    }));
  };

  const getCurrentNotes = (): NoteItem[] => {
    if (!activeFolderId || !activeWorkspaceId) return [];
    return notesData[activeFolderId]?.[activeWorkspaceId] || [];
  };

  // --- HANDLERS UTAMA ---

  const handleBackToFolders = useCallback(() => {
    setActiveFolderId(null);
    setActiveWorkspaceId("");
    setSelectedNote(null);
  }, []);

  const handleBackToWorkspaces = useCallback(() => {
    setActiveWorkspaceId("");
    setSelectedNote(null);
  }, []);

  const handleCreateFolder = useCallback(async (folderName: string) => {
    try {
      const newFolder = await NoteService.createFolder(folderName);
      setFolders(prev => [...prev, { 
        id: newFolder.id, 
        name: newFolder.name, 
        icon: newFolder.icon_name ? getIconByName(newFolder.icon_name) : Folder 
      }]);
      setNotesData(prev => ({ ...prev, [newFolder.id]: {} }));
      setActiveFolderId(newFolder.id);
      setActiveWorkspaceId("");
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  }, []);

  const handleCreateWorkspace = useCallback(async (wsName: string, icon: LucideIcon) => {
    if (!activeFolderId) return;
    try {
      const iconName = getIconName(icon);
      const newWs = await NoteService.createWorkspace(activeFolderId, wsName, iconName);
      setNotesData(prev => ({
        ...prev,
        [activeFolderId]: { ...prev[activeFolderId], [newWs.id]: [] }
      }));
      setWorkspaceIcons(prev => ({ ...prev, [newWs.id]: icon }));
      setWorkspaceNames(prev => ({ ...prev, [newWs.id]: wsName }));
      setActiveWorkspaceId(newWs.id);
      setSelectedNote(null);
    } catch (error) {
      console.error("Failed to create workspace:", error);
    }
  }, [activeFolderId]);

  const handleRenameWorkspace = useCallback(async (wsId: string, newName: string) => {
    try {
      // Get current icon if any
      const currentIcon = workspaceIcons[wsId];
      const iconName = currentIcon ? getIconName(currentIcon) : undefined;
      
      await NoteService.updateWorkspace(wsId, newName, iconName);
      setWorkspaceNames(prev => ({ ...prev, [wsId]: newName }));
    } catch (error) {
      console.error("Failed to rename workspace:", error);
    }
  }, [workspaceIcons]);

  const handleDeleteWorkspace = useCallback(async (wsId: string) => {
    try {
      await NoteService.deleteWorkspace(wsId);
      setNotesData(prev => {
        if (!activeFolderId) return prev;
        const folderData = { ...prev[activeFolderId] };
        delete folderData[wsId];
        return { ...prev, [activeFolderId]: folderData };
      });
      if (activeWorkspaceId === wsId) {
        setActiveWorkspaceId("");
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    }
  }, [activeFolderId, activeWorkspaceId]);

  const handleRenameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      // Get current icon if any
      const folder = folders.find(f => f.id === folderId);
      const iconName = folder?.icon ? getIconName(folder.icon) : undefined;
      
      await NoteService.updateFolder(folderId, newName, iconName);
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f));
    } catch (error) {
      console.error("Failed to rename folder:", error);
    }
  }, [folders]);

  const handleDeleteFolder = useCallback(async (folderId: string) => {
    try {
      await NoteService.deleteFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setNotesData(prev => {
        const { [folderId]: _, ...rest } = prev;
        return rest;
      });
      if (activeFolderId === folderId) {
        setActiveFolderId(null);
        setActiveWorkspaceId("");
      }
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  }, [activeFolderId]);

  const handleFolderSelect = useCallback((folderId: string) => {
    setActiveFolderId(folderId);
    setActiveWorkspaceId("");
    setSelectedNote(null);
  }, []);

  const handleWorkspaceSelect = useCallback((wsId: string) => {
    setActiveWorkspaceId(wsId);
    setSelectedNote(null);
  }, []);

  const handleNoteSelect = useCallback(async (noteItem: NoteItem) => {
    try {
      setSelectedNote(noteItem);
      const fullNote = await NoteService.getById(noteItem.id);
      
      setSelectedNote({
        ...noteItem,
        title: fullNote.title,
        content: extractContentHtml(fullNote.content, fullNote.plain_text_preview),
        desc: fullNote.plain_text_preview || "- "
      });
    } catch (error) {
      console.error("Failed to fetch note details:", error);
    }
  }, [extractContentHtml]);

  // --- CRUD NOTES ---
  const createNote = useCallback(async () => {
    if (!activeWorkspaceId || !activeFolderId) return;
    try {
      const newNoteApi = await NoteService.createNote(activeWorkspaceId, "Untitled Note");
      const realId = newNoteApi.id;
      
      const newNote: NoteItem = {
        id: realId,
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
      setSelectedNote(newNote);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  }, [activeFolderId, activeWorkspaceId, extractContentHtml]);

  const deleteNote = useCallback(async (noteId: string) => {
    try {
      await NoteService.deleteNote(noteId);
      
      setNotesData(prev => {
        if (!activeFolderId || !activeWorkspaceId) return prev;
        const folderData = prev[activeFolderId];
        const wsNotes = folderData[activeWorkspaceId] || [];
        
        return {
          ...prev,
          [activeFolderId]: {
            ...folderData,
            [activeWorkspaceId]: wsNotes.filter(n => n.id !== noteId)
          }
        };
      });

      setSelectedNote(current => (current?.id === noteId ? null : current));
      
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  }, [activeFolderId, activeWorkspaceId]);

  const duplicateNote = useCallback(async (note: NoteItem) => {
    if (!activeWorkspaceId || !activeFolderId) return;
    try {
      const newNoteApi = await NoteService.duplicateNote(note.id);
      const realId = newNoteApi.id;

      const copy: NoteItem = {
        id: realId,
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
      
      setNotesData(prev => {
        if (!activeFolderId || !activeWorkspaceId) return prev;
        const folderData = prev[activeFolderId];
        const wsNotes = folderData[activeWorkspaceId] || [];

        return {
          ...prev,
          [activeFolderId]: {
            ...folderData,
            [activeWorkspaceId]: wsNotes.map(n =>
              n.id === updated.id ? {
                ...updated,
                desc: updatedApi.plain_text_preview || previewText,
                time: new Date(updatedApi.updated_at).toLocaleDateString()
              } : n
            )
          }
        };
      });
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

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center">Loading...</div>;
  }

  const activeFolderName = getActiveFolderName();

  return (
    <div className="flex h-full w-full overflow-hidden">
      <NotesSidebar
        folders={folders}
        activeFolderId={activeFolderId}
        activeWorkspaceId={activeWorkspaceId}
        workspaces={getCurrentWorkspaces()}
        customIcons={workspaceIcons}
        onFolderSelect={handleFolderSelect}
        onWorkspaceSelect={handleWorkspaceSelect}
        onCreateFolder={handleCreateFolder}
        onCreateWorkspace={handleCreateWorkspace}
        onRenameWorkspace={handleRenameWorkspace}
        onDeleteWorkspace={handleDeleteWorkspace}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <main className="flex-1 h-full overflow-hidden flex min-w-0">
        {!activeFolderId ? (
          <FolderDashboard
            folders={folders}
            onSelect={handleFolderSelect}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            onCreateFolder={handleCreateFolder}
          />
        ) : activeWorkspaceId === "" ? (
          <WorkspaceDashboard
            workspaces={getCurrentWorkspaces()}
            onSelect={handleWorkspaceSelect}
            onRenameWorkspace={handleRenameWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
            onBack={handleBackToFolders}
          />
        ) : (
          <>
            <NotesContentPanel
              folder={activeFolderName!}
              workspace={getActiveWorkspaceName()}
              workspaceId={activeWorkspaceId}
              notes={getCurrentNotes()}
              createNote={createNote}
              duplicateNote={duplicateNote}
              deleteNote={deleteNote}
              onNoteClick={handleNoteSelect}
              isDetailOpen={isDetailOpen}
              activeNoteId={selectedNote?.id}
              onBack={handleBackToWorkspaces}
              onRenameWorkspace={handleRenameWorkspace}
              onReorderNotes={handleReorderNotes}
            />
            <AnimatePresence mode="popLayout">
              {isDetailOpen && (
                <NoteDetailPanel
                  key="detail-panel"
                  note={selectedNote!}
                  onClose={() => setSelectedNote(null)}
                  onDelete={deleteNote}
                  onUpdate={updateNote}
                  onCreateNew={createNote}
                />
              )}
            </AnimatePresence>
          </>
        )}
      </main>
    </div>
  );
}
