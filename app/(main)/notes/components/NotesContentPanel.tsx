"use client";

import { Plus, Copy, Search, ArrowLeft, Trash2, Edit2, GripVertical, Link2, Check } from "lucide-react";
import type { NoteItem } from "./NotesClientWrapper";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import { Reorder, useDragControls, motion } from "framer-motion";

type Props = {
  folder: string;
  workspace: string;
  workspaceId: string;
  notes: NoteItem[];
  onNoteClick: (note: NoteItem) => void;
  createNote: () => void;
  duplicateNote: (note: NoteItem) => void;
  deleteNote: (noteId: string) => void;
  isDetailOpen: boolean;
  activeNoteId?: string | null;
  onBack: () => void;
  onRenameWorkspace: (wsId: string, newName: string) => void;
  onReorderNotes: (newNotes: NoteItem[]) => void;
};

function NoteCard({ 
  note, 
  isActive, 
  isDetailOpen, 
  onNoteClick, 
  duplicateNote, 
  deleteNote, 
  stripHtml,
  folder,
  workspace
}: { 
  note: NoteItem, 
  isActive: boolean, 
  isDetailOpen: boolean,
  onNoteClick: (n: NoteItem) => void,
  duplicateNote: (n: NoteItem) => void,
  deleteNote: (id: string) => void,
  stripHtml: (h: string) => string,
  folder: string,
  workspace: string
}) {
  const controls = useDragControls();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `notes://${encodeURIComponent(folder)}/${encodeURIComponent(workspace)}/${note.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Reorder.Item
      value={note}
      dragListener={false}
      dragControls={controls}
      className={clsx(
        "group relative rounded-2xl border cursor-pointer overflow-hidden bg-white touch-none",
        isActive
          ? "ring-2 ring-black border-transparent shadow-md"
          : "hover:border-slate-300 hover:shadow-md border-slate-200",
        note.highlight ? "bg-orange-50/50 border-orange-100" : "bg-white"
      )}
    >
      <div className="w-full flex gap-3">
        {!isDetailOpen && (
          <div
            onPointerDown={(e) => controls.start(e)}
            onClick={(e) => e.stopPropagation()}
            className={clsx(
              "text-slate-300 hover:text-slate-600 transition-colors flex-shrink-0 cursor-grab active:cursor-grabbing flex items-center justify-center w-10",
              isDetailOpen ? "py-4" : "py-6"
            )}
          >
            <GripVertical className="w-5 h-5" />
          </div>
        )}

        <div 
          className={clsx(
            "flex-1 min-w-0 pr-6",
            isDetailOpen ? "py-4 pl-4" : "py-6",
            !isDetailOpen && "pl-0"
          )}
          onClick={() => onNoteClick(note)}
        >
          <h2 className={clsx("font-semibold text-slate-900 mb-2 truncate", isDetailOpen ? "text-sm" : "text-lg")}>
            {note.title || "Untitled Note"}
          </h2>

          {!isDetailOpen && (
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {note.desc ? stripHtml(note.desc) : "No additional text content..."}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">{note.time}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopyLink}
                className={clsx("flex items-center gap-1.5 rounded-md transition-colors", copied ? "bg-green-50 text-green-600" : "hover:bg-blue-50 text-slate-500 hover:text-blue-600", !isDetailOpen ? "px-3 py-1.5" : "p-1.5")}
                title="Copy share link for tasks"
              >
                {copied ? <Check className="w-4 h-4" /> : <Link2 className={clsx(!isDetailOpen ? "w-4 h-4" : "w-3.5 h-3.5")} />}
                {!isDetailOpen && <span className="text-xs font-medium">{copied ? "Copied!" : "Link"}</span>}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); duplicateNote(note); }}
                className={clsx("flex items-center gap-1.5 rounded-md transition-colors hover:bg-slate-100", !isDetailOpen ? "px-3 py-1.5 text-slate-500 hover:text-black" : "p-1.5 text-slate-400 hover:text-black")}
              >
                <Copy className={clsx(!isDetailOpen ? "w-4 h-4" : "w-3.5 h-3.5")} />
                {!isDetailOpen && <span className="text-xs font-medium">Duplicate</span>}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className={clsx("flex items-center gap-1.5 rounded-md transition-colors hover:bg-red-50", !isDetailOpen ? "px-3 py-1.5 text-slate-500 hover:text-red-600" : "p-1.5 text-slate-400 hover:text-red-600")}
              >
                <Trash2 className={clsx(!isDetailOpen ? "w-4 h-4" : "w-3.5 h-3.5")} />
                {!isDetailOpen && <span className="text-xs font-medium">Delete</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}

export default function NotesContentPanel({
  folder,
  workspace,
  workspaceId,
  notes,
  onNoteClick,
  createNote,
  duplicateNote,
  deleteNote,
  isDetailOpen,
  activeNoteId,
  onBack,
  onRenameWorkspace,
  onReorderNotes,
}: Props) {
  const safeWorkspaceName = workspace || "";
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(safeWorkspaceName);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTempName(safeWorkspaceName); }, [safeWorkspaceName]);
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    const trimmed = tempName.trim();
    if (trimmed && trimmed !== safeWorkspaceName) onRenameWorkspace(workspaceId, trimmed);
    else setTempName(safeWorkspaceName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") { setIsEditing(false); setTempName(safeWorkspaceName); }
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.desc && n.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      animate={{ 
        width: isDetailOpen ? 300 : "100%",
        flex: isDetailOpen ? "0 0 300px" : "1 1 0%"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={clsx(
        "relative h-full overflow-y-auto bg-white py-8 min-w-0 border-r transition-colors duration-300",
        isDetailOpen ? "px-4 border-slate-100" : "px-10 border-transparent"
      )}
    >
      {!isDetailOpen && (
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="group flex items-center gap-2 text-sm text-slate-400 hover:text-slate-800 font-medium px-2 py-1.5 -ml-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600" />
              <input 
                placeholder="Search notes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-full text-sm outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 transition-all" 
              />
            </div>
            <button onClick={createNote} className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-slate-800 active:scale-95 transition-all">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>
      )}

      {!isDetailOpen && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{folder}</span>
             <span className="text-[10px] text-slate-300">/</span>
          </div>
          {isEditing ? (
            <input ref={inputRef} value={tempName} onChange={(e) => setTempName(e.target.value)} onBlur={handleSave} onKeyDown={handleKeyDown} className="text-4xl font-bold text-slate-900 tracking-tight bg-slate-100 px-2 py-1 rounded-lg outline-none w-full max-w-2xl" />
          ) : (
            <div onClick={() => setIsEditing(true)} className="group flex items-center gap-3 cursor-pointer w-fit">
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{safeWorkspaceName}</h1>
              <Edit2 className="w-5 h-5 text-slate-300 opacity-0 group-hover:opacity-100 transition-all hover:text-slate-600" />
            </div>
          )}
          <p className="text-slate-500 mt-1 text-sm">{filteredNotes.length} notes found</p>
        </div>
      )}

      <div className="pb-20">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-slate-400 text-sm font-medium">
              {searchQuery ? "No notes match your search." : "No notes here yet."}
            </p>
            {!searchQuery && (
              <button onClick={createNote} className="mt-2 text-sm text-black underline underline-offset-4 hover:text-slate-600">Create your first note</button>
            )}
          </div>
        ) : (
          <Reorder.Group axis="y" values={filteredNotes} onReorder={onReorderNotes} className="flex flex-col gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isActive={activeNoteId === note.id}
                isDetailOpen={isDetailOpen}
                onNoteClick={onNoteClick}
                duplicateNote={duplicateNote}
                deleteNote={deleteNote}
                stripHtml={stripHtml}
                folder={folder}
                workspace={workspace}
              />
            ))}
          </Reorder.Group>
        )}
      </div>
    </motion.div>
  );
}
