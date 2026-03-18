"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
//   Check,
//   X,
  AlertTriangle,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import clsx from "clsx";

type Props = {
  wsName: string;
  onRename: (newName: string) => void;
  onDelete: () => void;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
};

type MenuState = "menu" | "rename" | "delete";

export default function WorkspaceActionMenu({
  wsName,
  onRename,
  onDelete,
  align = "end",
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MenuState>("menu");
  const [tempName, setTempName] = useState(wsName);

  // Reset state saat popover ditutup/dibuka
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setView("menu");
        setTempName(wsName);
      }, 200); // Delay reset biar transisi smooth
    }
  };

  const handleRenameSubmit = () => {
    if (tempName.trim() && tempName !== wsName) {
      onRename(tempName);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "p-1 rounded-md transition-all focus:opacity-100 outline-none",
            triggerClassName ||
              "hover:bg-slate-200 text-slate-500 hover:text-black"
          )}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className="w-48 p-2 bg-white border shadow-lg rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* VIEW: MENU UTAMA */}
        {view === "menu" && (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => setView("rename")}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition"
            >
              <Pencil className="w-3.5 h-3.5" /> Rename
            </button>
            <button
              onClick={() => setView("delete")}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}

        {/* VIEW: RENAME INPUT */}
        {view === "rename" && (
          <div className="flex flex-col gap-2 p-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Rename Workspace
            </label>
            <input
              autoFocus
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="w-full text-sm border border-slate-300 rounded px-2 py-1 outline-none focus:border-black focus:ring-1 focus:ring-black"
            />
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setView("menu")}
                className="flex-1 bg-slate-100 text-slate-600 text-xs py-1.5 rounded hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                disabled={!tempName.trim()}
                className="flex-1 bg-black text-white text-xs py-1.5 rounded hover:opacity-80 transition disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* VIEW: DELETE CONFIRMATION */}
        {view === "delete" && (
          <div className="flex flex-col gap-2 p-1">
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-bold">Delete Workspace?</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setView("menu")}
                className="flex-1 bg-slate-100 text-slate-600 text-xs py-1.5 rounded hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setOpen(false);
                }}
                className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
