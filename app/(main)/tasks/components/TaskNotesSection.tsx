"use client";

import { useEffect, useMemo, useState } from "react";
import { StickyNote, Plus, X, Search, FolderOpen } from "lucide-react";
import clsx from "clsx";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { NoteService, ApiWorkspace, ApiFolder } from "../../notes/services/note-service";
import { TaskNote } from "./task-types";
import CustomSelect from "./ui/CustomSelect";

type Props = {
  workspaceId: string | null;
  notes: TaskNote[];
  onAttach: (noteId: string) => Promise<void>;
  onDetach: (taskNoteId: string) => Promise<void>;
  onOpen: (note: TaskNote) => void;
};

type Mode = "pick" | "create";

export default function TaskNotesSection({ workspaceId, notes, onAttach, onDetach, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("pick");
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<ApiFolder[]>([]);
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [targetFolderId, setTargetFolderId] = useState("");
  const [busy, setBusy] = useState(false);
  const attachedNoteIds = useMemo(() => new Set(notes.map((n) => n.noteId)), [notes]);

  useEffect(() => {
    if (!open || !workspaceId) return;
    setLoading(true);
    NoteService.getAll()
      .then((workspaces: ApiWorkspace[]) => {
        const ws = workspaces.find((w) => w.id === workspaceId);
        const fs = ws?.folders || [];
        setFolders(fs);
        setTargetFolderId((prev) => prev || fs[0]?.id || "");
      })
      .catch(() => setFolders([]))
      .finally(() => setLoading(false));
  }, [open, workspaceId]);

  const filteredFolders = useMemo(() => {
    if (!search.trim()) return folders;
    const q = search.trim().toLowerCase();
    return folders
      .map((f) => ({ ...f, notes: f.notes.filter((n) => n.title.toLowerCase().includes(q)) }))
      .filter((f) => f.notes.length > 0);
  }, [folders, search]);

  const resetAndClose = () => {
    setOpen(false);
    setMode("pick");
    setSearch("");
    setNewTitle("");
  };

  const handlePick = async (noteId: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await onAttach(noteId);
      resetAndClose();
    } catch (e) {
      console.error("Failed to attach note:", e);
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !targetFolderId || busy) return;
    setBusy(true);
    try {
      const note = await NoteService.createNote(targetFolderId, newTitle.trim());
      await onAttach(note.id);
      resetAndClose();
    } catch (e) {
      console.error("Failed to create note:", e);
    } finally {
      setBusy(false);
    }
  };

  const detach = (taskNoteId: string) => {
    onDetach(taskNoteId).catch((e) => console.error("Failed to detach note:", e));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-700">
          <StickyNote className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold">Notes</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {notes.map((n) => (
          <div
            key={n.id}
            className="group/note relative flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 w-[180px]"
          >
            <button
              onClick={() => onOpen(n)}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 text-amber-500">
                <StickyNote size={16} />
              </div>
              <p className="text-xs font-bold text-slate-700 truncate">{n.title}</p>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                detach(n.id);
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover/note:opacity-100 transition"
            >
              <X size={9} />
            </button>
          </div>
        ))}

        <Popover open={open} onOpenChange={(v) => (v ? setOpen(true) : resetAndClose())}>
          <PopoverTrigger asChild>
            <button
              disabled={!workspaceId}
              className="flex items-center justify-center w-[52px] h-[52px] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl transition text-slate-400 hover:text-blue-500 disabled:opacity-40"
              title={workspaceId ? "Add note" : "Select a workspace first"}
            >
              <Plus size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <div className="flex bg-slate-100 p-1 rounded-lg mb-3">
              <button
                onClick={() => setMode("pick")}
                className={clsx(
                  "flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all",
                  mode === "pick" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                )}
              >
                Pilih Existing
              </button>
              <button
                onClick={() => setMode("create")}
                className={clsx(
                  "flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all",
                  mode === "create" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                )}
              >
                Buat Baru
              </button>
            </div>

            {mode === "pick" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <Search size={13} className="text-slate-400 shrink-0" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari note..."
                    className="flex-1 text-xs bg-transparent outline-none"
                  />
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2.5">
                  {loading && <p className="text-xs text-slate-400 italic px-1">Memuat...</p>}
                  {!loading && filteredFolders.length === 0 && (
                    <p className="text-xs text-slate-400 italic px-1">Tidak ada note ditemukan.</p>
                  )}
                  {filteredFolders.map((f) => (
                    <div key={f.id}>
                      <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1">
                        <FolderOpen size={11} /> {f.name}
                      </p>
                      {f.notes.map((n) => {
                        const attached = attachedNoteIds.has(n.id);
                        return (
                          <button
                            key={n.id}
                            disabled={attached || busy}
                            onClick={() => handlePick(n.id)}
                            className={clsx(
                              "w-full text-left px-2 py-1.5 rounded-lg text-xs font-medium transition truncate",
                              attached ? "text-slate-300 cursor-default" : "text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            )}
                          >
                            {n.title || "Untitled"} {attached && <span className="text-[10px]">(sudah ditambahkan)</span>}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Judul note baru..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-transparent focus:border-slate-200 rounded-lg outline-none transition"
                />
                <CustomSelect
                  label="Folder"
                  value={targetFolderId}
                  options={folders.map((f) => ({ id: f.id, label: f.name }))}
                  onChange={setTargetFolderId}
                  triggerClassName="py-2 w-full"
                />
                <button
                  onClick={handleCreate}
                  disabled={!newTitle.trim() || !targetFolderId || busy}
                  className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-bold disabled:opacity-30 transition"
                >
                  {busy ? "Membuat..." : "Buat & Sematkan"}
                </button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
