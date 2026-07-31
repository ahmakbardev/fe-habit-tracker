"use client";

import {
  Folder,
  FileText,
  Download,
  Trash2,
  StickyNote,
  ListTodo,
  Megaphone,
  Music,
  HelpCircle,
  LayoutGrid,
  Code2,
  Plus,
  ChevronDown,
  Hash,
  Check,
  X,
  // [FIX] Import tipe LucideIcon
  LucideIcon,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import CreateWorkspacePopover from "./CreateWorkspacePopover";
import ItemActionMenu from "./ItemActionMenu";

// [FIX] Gunakan Record<string, LucideIcon>
const DEFAULT_FOLDER_ICONS: Record<string, LucideIcon> = {
  Notes: StickyNote,
  Tasks: ListTodo,
  Announcements: Megaphone,
  Music: Music,
  Questions: HelpCircle,
  Dashboard: LayoutGrid,
  Development: Code2,
};

const mainMenu = [
  { label: "Templates", icon: FileText },
  { label: "Import", icon: Download },
  { label: "Trash", icon: Trash2 },
];

type NotesSidebarProps = {
  // [FIX] Ganti any dengan LucideIcon
  workspaces: { id: string; name: string; icon: LucideIcon }[];
  activeWorkspaceId: string | null;
  activeFolderId: string;
  folders: { id: string; name: string }[];
  // [FIX] Ganti any dengan LucideIcon
  customIcons: Record<string, LucideIcon>;
  onWorkspaceSelect: (id: string) => void;
  onFolderSelect: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  // [FIX] Ganti any dengan LucideIcon
  onCreateFolder: (name: string, icon: LucideIcon) => void;
  // Workspace Actions
  onRenameWorkspace: (id: string, newName: string) => void;
  onDeleteWorkspace: (id: string) => void;
  // Folder Actions
  onRenameFolder?: (id: string, newName: string) => void;
  onDeleteFolder?: (id: string) => void;
};

export default function NotesSidebar({
  workspaces,
  activeWorkspaceId,
  activeFolderId,
  folders,
  customIcons,
  onWorkspaceSelect,
  onFolderSelect,
  onCreateWorkspace,
  onCreateFolder,
  onRenameWorkspace,
  onDeleteWorkspace,
  onRenameFolder = () => {},
  onDeleteFolder = () => {},
}: NotesSidebarProps) {
  const [activeMain, setActiveMain] = useState<string>("");

  // State untuk Workspace Popover
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const [isAddingWorkspace, setIsAddingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  // --- State untuk Folder Popover ---
  const [folderPopoverOpen, setFolderPopoverOpen] = useState(false);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const displayWorkspaceName = activeWorkspace?.name || "Select Workspace";

  const handleAddWorkspaceSubmit = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setIsAddingWorkspace(false);
      setWorkspacePopoverOpen(false);
    }
  };

  return (
    <aside className="h-full w-full bg-white border-r border-slate-200 flex flex-col justify-between z-20 flex-shrink-0">
      <div>
        {/* WORKSPACE SWITCHER */}
        <Popover
          open={workspacePopoverOpen}
          onOpenChange={(open) => {
            setWorkspacePopoverOpen(open);
            if (!open) setIsAddingWorkspace(false);
          }}
        >
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-6 w-full hover:bg-slate-50 transition">
              <Folder
                className={clsx(
                  "w-6 h-6",
                  activeWorkspaceId ? "text-orange-500" : "text-slate-400"
                )}
              />
              <span
                className={clsx(
                  "font-medium truncate",
                  activeWorkspaceId ? "text-slate-800" : "text-slate-400"
                )}
              >
                {displayWorkspaceName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={4}
            className="w-[216px] p-2 bg-white shadow-md border rounded-xl"
          >
            {/* List Existing Workspaces */}
            <div className="max-h-48 overflow-y-auto">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  className={clsx(
                    "group flex items-center w-full rounded-md text-sm transition pr-1",
                    activeWorkspaceId === workspace.id
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <button
                    onClick={() => {
                      onWorkspaceSelect(workspace.id);
                      setWorkspacePopoverOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-left truncate"
                  >
                    <workspace.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{workspace.name}</span>
                  </button>

                  {/* WORKSPACE ACTION MENU */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ItemActionMenu
                      itemName={workspace.name}
                      itemType="Workspace"
                      onRename={(newName) =>
                        onRenameWorkspace(workspace.id, newName)
                      }
                      onDelete={() => onDeleteWorkspace(workspace.id)}
                      triggerClassName="hover:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section Add Workspace */}
            <div className="mt-2 pt-2 border-t border-slate-200">
              {isAddingWorkspace ? (
                <div className="px-1 pb-1">
                  <input
                    autoFocus
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    placeholder="Name..."
                    className="w-full text-sm border rounded px-2 py-1 mb-2 outline-none focus:border-orange-500"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddWorkspaceSubmit()
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddWorkspaceSubmit}
                      className="flex-1 bg-black text-white text-xs py-1 rounded hover:opacity-80 flex justify-center items-center"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsAddingWorkspace(false)}
                      className="flex-1 bg-slate-100 text-slate-600 text-xs py-1 rounded hover:bg-slate-200 flex justify-center items-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingWorkspace(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" /> Add Workspace
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* MAIN MENU */}
        <nav className="px-3">
          {mainMenu.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMain(item.label)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                activeMain === item.label
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* FOLDER LIST */}
        {activeWorkspace && (
          <>
            <div className="mt-6 px-5 text-xs font-semibold text-slate-400 tracking-wide flex items-center justify-between">
              FOLDER
              {/* --- Popover Controlled State --- */}
              <Popover open={folderPopoverOpen} onOpenChange={setFolderPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-slate-200 rounded-md transition">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </PopoverTrigger>
                <CreateWorkspacePopover
                  itemLabel="Folder"
                  onCreate={(folder) => {
                    onCreateFolder(folder.label, folder.icon);
                    // Tutup popover secara manual setelah create
                    setFolderPopoverOpen(false);
                  }}
                />
              </Popover>
            </div>

            <nav className="mt-2 px-3 pb-20 overflow-y-auto max-h-[calc(100vh-300px)]">
              {folders.length === 0 ? (
                <p className="px-3 text-xs text-slate-400 italic mt-2">
                  No folders yet.
                </p>
              ) : (
                folders.map((folder) => {
                  const isActive = activeFolderId === folder.id;
                  const Icon =
                    customIcons[folder.id] ||
                    DEFAULT_FOLDER_ICONS[folder.name] ||
                    Hash;

                  return (
                    <div
                      key={folder.id}
                      className={clsx(
                        "group flex items-center w-full rounded-md text-sm transition-all pr-1",
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <button
                        onClick={() => onFolderSelect(folder.id)}
                        className="flex-1 flex items-center gap-3 px-3 py-2 text-left truncate"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </button>

                      {/* FOLDER ACTION MENU */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ItemActionMenu
                          itemName={folder.name}
                          itemType="Folder"
                          onRename={(newName) =>
                            onRenameFolder(folder.id, newName)
                          }
                          onDelete={() => onDeleteFolder(folder.id)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </nav>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        <button className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition">
          <Plus className="w-4 h-4" />
          New Page
        </button>
      </div>
    </aside>
  );
}
