"use client";

import { useState } from "react";
// 1. Tambahkan import LucideIcon
import { Folder, LucideIcon } from "lucide-react";
import NotesSidebar from "./NotesSidebar";
import NotesContentPanel from "./NotesContentPanel";
import NoteDetailPanel from "./NoteDetailPanel";
import WorkspaceDashboard from "./WorkspaceDashboard";
import FolderDashboard from "./FolderDashboard";
import { initialNotesData, type NotesDataStructure } from "./workspace-data";

export type NoteItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  highlight?: boolean;
  location?: string;
};

const initialFolders = [
  { name: "Awsmd", icon: Folder },
  { name: "Work Notes", icon: Folder },
  { name: "Personal", icon: Folder },
  { name: "Projects", icon: Folder },
];

export default function NotesClientWrapper() {
  // --- STATE ---
  const [folders, setFolders] = useState(initialFolders);

  // 2. Ganti <Record<string, any>> menjadi <Record<string, LucideIcon>>
  const [workspaceIcons, setWorkspaceIcons] = useState<
    Record<string, LucideIcon>
  >({});

  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("");
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);

  const [notesData, setNotesData] =
    useState<NotesDataStructure>(initialNotesData);

  const isDetailOpen = selectedNote !== null;

  // --- HELPER GETTERS ---
  const getCurrentWorkspaces = (): string[] => {
    if (!activeFolder) return [];
    return Object.keys(notesData[activeFolder] || {});
  };

  const getCurrentNotes = (): NoteItem[] => {
    if (!activeFolder || !activeWorkspace) return [];
    return notesData[activeFolder]?.[activeWorkspace] || [];
  };

  // --- HANDLERS UTAMA ---

  // [BARU] Handler Back Logic
  const handleBackToFolders = () => {
    setActiveFolder(null); // Reset folder selection
    setActiveWorkspace(""); // Reset workspace
    setSelectedNote(null);
  };

  const handleBackToWorkspaces = () => {
    setActiveWorkspace(""); // Reset workspace only
    setSelectedNote(null);
  };

  const handleCreateFolder = (folderName: string) => {
    if (folders.some((f) => f.name === folderName)) return;
    setFolders((prev) => [...prev, { name: folderName, icon: Folder }]);
    setNotesData((prev) => ({ ...prev, [folderName]: {} }));
    setActiveFolder(folderName);
    setActiveWorkspace("");
  };

  // 3. Ganti parameter (icon: any) menjadi (icon: LucideIcon)
  const handleCreateWorkspace = (wsName: string, icon: LucideIcon) => {
    if (!activeFolder) return;
    setNotesData((prev) => ({
      ...prev,
      [activeFolder]: { ...prev[activeFolder], [wsName]: [] },
    }));
    setWorkspaceIcons((prev) => ({ ...prev, [wsName]: icon }));
    setActiveWorkspace(wsName);
    setSelectedNote(null);
  };

  // --- ACTIONS: WORKSPACE (Rename & Delete) ---
  const handleRenameWorkspace = (oldName: string, newName: string) => {
    if (!activeFolder || !newName.trim() || oldName === newName) return;

    setNotesData((prev) => {
      const folderData = prev[activeFolder];
      const { [oldName]: dataToMove, ...rest } = folderData;
      return {
        ...prev,
        [activeFolder]: { ...rest, [newName]: dataToMove || [] },
      };
    });

    setWorkspaceIcons((prev) => {
      const { [oldName]: icon, ...rest } = prev;
      return { ...rest, [newName]: icon };
    });

    if (activeWorkspace === oldName) setActiveWorkspace(newName);
  };

  const handleDeleteWorkspace = (wsName: string) => {
    if (!activeFolder) return;
    setNotesData((prev) => {
      const folderData = { ...prev[activeFolder] };
      delete folderData[wsName];
      return { ...prev, [activeFolder]: folderData };
    });
    if (activeWorkspace === wsName) {
      setActiveWorkspace("");
      setSelectedNote(null);
    }
  };

  // --- ACTIONS: FOLDER (Rename & Delete) ---
  const handleRenameFolder = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    if (folders.some((f) => f.name === newName)) return;
    setFolders((prev) =>
      prev.map((f) => (f.name === oldName ? { ...f, name: newName } : f))
    );
    setNotesData((prev) => {
      const { [oldName]: content, ...rest } = prev;
      return { ...rest, [newName]: content || {} };
    });
    if (activeFolder === oldName) setActiveFolder(newName);
  };

  const handleDeleteFolder = (folderName: string) => {
    setFolders((prev) => prev.filter((f) => f.name !== folderName));
    setNotesData((prev) => {
      // [FIX] Rename 'deleted' menjadi '_deleted' (atau '_')
      // Linter biasanya mengabaikan variabel yang diawali underscore jika tidak digunakan.
      const { [folderName]: __delete, ...rest } = prev;
      void __delete;
      return rest;
    });
    if (activeFolder === folderName) {
      setActiveFolder(null);
      setActiveWorkspace("");
    }
  };

  const handleFolderSelect = (folderName: string) => {
    setActiveFolder(folderName);
    setActiveWorkspace("");
    setSelectedNote(null);
  };

  const handleWorkspaceSelect = (ws: string) => {
    setActiveWorkspace(ws);
    setSelectedNote(null);
  };

  // --- CRUD NOTES ---
  const createNote = () => {
    if (!activeFolder || !activeWorkspace) return;
    const newNote: NoteItem = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      desc: "",
      time: "now",
    };
    setNotesData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeWorkspace]: [newNote, ...prev[activeFolder][activeWorkspace]],
      },
    }));
    setSelectedNote(newNote);
  };

  const deleteNote = (noteId: string) => {
    if (!activeFolder || !activeWorkspace) return;
    setNotesData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeWorkspace]: prev[activeFolder][activeWorkspace].filter(
          (n) => n.id !== noteId
        ),
      },
    }));
    setSelectedNote(null);
  };

  const duplicateNote = (note: NoteItem) => {
    if (!activeFolder || !activeWorkspace) return;
    const copy = {
      ...note,
      id: crypto.randomUUID(),
      title: note.title + " (copy)",
    };
    setNotesData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeWorkspace]: [copy, ...prev[activeFolder][activeWorkspace]],
      },
    }));
  };

  const updateNote = (updated: NoteItem) => {
    if (!activeFolder || !activeWorkspace) return;
    setNotesData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeWorkspace]: prev[activeFolder][activeWorkspace].map((n) =>
          n.id === updated.id ? updated : n
        ),
      },
    }));
  };

  return (
    <>
      <NotesSidebar
        folders={folders}
        activeFolder={activeFolder}
        activeWorkspace={activeWorkspace}
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

      {!activeFolder ? (
        <FolderDashboard
          folders={folders}
          onSelect={handleFolderSelect}
          onRenameFolder={handleRenameFolder}
          onDeleteFolder={handleDeleteFolder}
          onCreateFolder={handleCreateFolder}
        />
      ) : activeWorkspace === "" ? (
        <WorkspaceDashboard
          workspaces={getCurrentWorkspaces()}
          onSelect={handleWorkspaceSelect}
          onRenameWorkspace={handleRenameWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onBack={handleBackToFolders} // [BARU]
        />
      ) : (
        <NotesContentPanel
          workspace={activeWorkspace}
          notes={getCurrentNotes()}
          createNote={createNote}
          duplicateNote={duplicateNote}
          deleteNote={deleteNote}
          onNoteClick={(note) => setSelectedNote(note)}
          isDetailOpen={isDetailOpen}
          activeNoteId={selectedNote?.id}
          onBack={handleBackToWorkspaces} // [BARU]
        />
      )}

      {isDetailOpen && (
        <NoteDetailPanel
          note={selectedNote!}
          onClose={() => setSelectedNote(null)}
          onDelete={deleteNote}
          onUpdate={updateNote}
          onCreateNew={createNote}
        />
      )}
    </>
  );
}
