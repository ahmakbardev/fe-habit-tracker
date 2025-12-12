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
const DEFAULT_WORKSPACE_ICONS: Record<string, LucideIcon> = {
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
  folders: { name: string; icon: LucideIcon }[];
  activeFolder: string | null;
  activeWorkspace: string;
  workspaces: string[];
  // [FIX] Ganti any dengan LucideIcon
  customIcons: Record<string, LucideIcon>;
  onFolderSelect: (folder: string) => void;
  onWorkspaceSelect: (ws: string) => void;
  onCreateFolder: (name: string) => void;
  // [FIX] Ganti any dengan LucideIcon
  onCreateWorkspace: (name: string, icon: LucideIcon) => void;
  // Workspace Actions
  onRenameWorkspace: (oldName: string, newName: string) => void;
  onDeleteWorkspace: (wsName: string) => void;
  // Folder Actions
  onRenameFolder?: (oldName: string, newName: string) => void;
  onDeleteFolder?: (folderName: string) => void;
};

export default function NotesSidebar({
  folders,
  activeFolder,
  activeWorkspace,
  workspaces,
  customIcons,
  onFolderSelect,
  onWorkspaceSelect,
  onCreateFolder,
  onCreateWorkspace,
  onRenameWorkspace,
  onDeleteWorkspace,
  onRenameFolder = () => {},
  onDeleteFolder = () => {},
}: NotesSidebarProps) {
  const [activeMain, setActiveMain] = useState<string>("");

  // State untuk Folder Popover
  const [folderPopoverOpen, setFolderPopoverOpen] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // --- [BARU] State untuk Workspace Popover ---
  const [wsPopoverOpen, setWsPopoverOpen] = useState(false);

  const displayFolderName = activeFolder || "Select Folder";

  const handleAddFolderSubmit = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName);
      setNewFolderName("");
      setIsAddingFolder(false);
      setFolderPopoverOpen(false);
    }
  };

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-64px)] w-[240px] bg-white border-r border-slate-200 flex flex-col justify-between z-20">
      <div>
        {/* FOLDER SWITCHER */}
        <Popover
          open={folderPopoverOpen}
          onOpenChange={(open) => {
            setFolderPopoverOpen(open);
            if (!open) setIsAddingFolder(false);
          }}
        >
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-6 w-full hover:bg-slate-50 transition">
              <Folder
                className={clsx(
                  "w-6 h-6",
                  activeFolder ? "text-orange-500" : "text-slate-400"
                )}
              />
              <span
                className={clsx(
                  "font-medium truncate",
                  activeFolder ? "text-slate-800" : "text-slate-400"
                )}
              >
                {displayFolderName}
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
            {/* List Existing Folders */}
            <div className="max-h-48 overflow-y-auto">
              {folders.map((folder) => (
                <div
                  key={folder.name}
                  className={clsx(
                    "group flex items-center w-full rounded-md text-sm transition pr-1",
                    activeFolder === folder.name
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <button
                    onClick={() => {
                      onFolderSelect(folder.name);
                      setFolderPopoverOpen(false);
                    }}
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-left truncate"
                  >
                    <folder.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </button>

                  {/* FOLDER ACTION MENU */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ItemActionMenu
                      itemName={folder.name}
                      itemType="Folder"
                      onRename={(newName) =>
                        onRenameFolder(folder.name, newName)
                      }
                      onDelete={() => onDeleteFolder(folder.name)}
                      triggerClassName="hover:bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Section Add Folder */}
            <div className="mt-2 pt-2 border-t border-slate-200">
              {isAddingFolder ? (
                <div className="px-1 pb-1">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Name..."
                    className="w-full text-sm border rounded px-2 py-1 mb-2 outline-none focus:border-orange-500"
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleAddFolderSubmit()
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddFolderSubmit}
                      className="flex-1 bg-black text-white text-xs py-1 rounded hover:opacity-80 flex justify-center items-center"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setIsAddingFolder(false)}
                      className="flex-1 bg-slate-100 text-slate-600 text-xs py-1 rounded hover:bg-slate-200 flex justify-center items-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingFolder(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-50"
                >
                  <Plus className="w-4 h-4" /> Add Folder
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

        {/* WORKSPACE LIST */}
        {activeFolder && (
          <>
            <div className="mt-6 px-5 text-xs font-semibold text-slate-400 tracking-wide flex items-center justify-between">
              WORKSPACE
              {/* --- Popover Controlled State --- */}
              <Popover open={wsPopoverOpen} onOpenChange={setWsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-slate-200 rounded-md transition">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </PopoverTrigger>
                <CreateWorkspacePopover
                  onCreate={(ws) => {
                    onCreateWorkspace(ws.label, ws.icon);
                    // Tutup popover secara manual setelah create
                    setWsPopoverOpen(false);
                  }}
                />
              </Popover>
            </div>

            <nav className="mt-2 px-3 pb-20 overflow-y-auto max-h-[calc(100vh-300px)]">
              {workspaces.length === 0 ? (
                <p className="px-3 text-xs text-slate-400 italic mt-2">
                  No workspaces yet.
                </p>
              ) : (
                workspaces.map((wsName) => {
                  const isActive = activeWorkspace === wsName;
                  const Icon =
                    customIcons[wsName] ||
                    DEFAULT_WORKSPACE_ICONS[wsName] ||
                    Hash;

                  return (
                    <div
                      key={wsName}
                      className={clsx(
                        "group flex items-center w-full rounded-md text-sm transition-all pr-1",
                        isActive
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <button
                        onClick={() => onWorkspaceSelect(wsName)}
                        className="flex-1 flex items-center gap-3 px-3 py-2 text-left truncate"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{wsName}</span>
                      </button>

                      {/* WORKSPACE ACTION MENU */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ItemActionMenu
                          itemName={wsName}
                          itemType="Workspace"
                          onRename={(newName) =>
                            onRenameWorkspace(wsName, newName)
                          }
                          onDelete={() => onDeleteWorkspace(wsName)}
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
