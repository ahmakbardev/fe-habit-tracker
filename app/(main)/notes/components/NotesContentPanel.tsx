"use client";

import { Plus, Copy, Search, ArrowLeft, Trash2, Edit2, GripVertical, Link2, Check } from "lucide-react";
import type { NoteItem } from "./NotesClientWrapper";
import clsx from "clsx";
import { useState, useRef, useEffect } from "react";
import { Reorder, useDragControls, motion, AnimatePresence } from "framer-motion";

type Props = {
  folder: string;
  workspace: string;
  workspaceId: string;
  notes: NoteItem[];
  onNoteClick: (note: NoteItem) => void;
  createNote: () => void;
  duplicateNote: (note: NoteItem) => void;
  deleteNote: (noteId: string) => void;
  toggleHighlight: (note: NoteItem) => void;
  isDetailOpen: boolean;
  activeNoteId?: string | null;
  onBack: () => void;
  onRenameWorkspace: (wsId: string, newName: string) => void;
  onReorderNotes: (newNotes: NoteItem[]) => void;
  isMobile?: boolean;
};

function NoteCard({ 
  note, 
  isActive, 
  isDetailOpen, 
  onNoteClick, 
  duplicateNote, 
  deleteNote, 
  toggleHighlight,
  stripHtml,
  folder,
  workspace,
  isMobile,
  isSearching
}: { 
  note: NoteItem, 
  isActive: boolean, 
  isDetailOpen: boolean,
  onNoteClick: (n: NoteItem) => void,
  duplicateNote: (n: NoteItem) => void,
  deleteNote: (id: string) => void,
  toggleHighlight: (n: NoteItem) => void,
  stripHtml: (h: string) => string,
  folder: string,
  workspace: string,
  isMobile: boolean,
  isSearching: boolean
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
      id={note.id}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      dragListener={false}
      dragControls={controls}
      className={clsx(
        "group relative rounded-2xl border cursor-pointer overflow-hidden touch-none select-none",
        isActive
          ? "ring-2 ring-black border-transparent shadow-lg z-10"
          : "border-slate-200 hover:border-slate-300 shadow-sm",
        note.highlight ? "bg-amber-50/50" : "bg-white",
        isMobile ? "rounded-xl" : "rounded-2xl"
      )}
    >
      {/* Highlight Indicator */}
      {note.highlight && (
        <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10px] right-[-10px] w-5 h-5 bg-amber-400 rotate-45" />
        </div>
      )}

      <div className="w-full flex">
        {!isDetailOpen && (
          <div
            onPointerDown={(e) => !isSearching && controls.start(e)}
            className={clsx(
              "flex-shrink-0 flex items-center justify-center transition-colors w-10 md:w-12",
              isSearching ? "opacity-0 pointer-events-none" : "text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing"
            )}
          >
            <GripVertical size={18} />
          </div>
        )}

        <div 
          className={clsx(
            "flex-1 min-w-0 py-5 pr-5",
            isDetailOpen ? "pl-4" : "pl-0"
          )}
          onClick={() => onNoteClick(note)}
        >
          <h2 className={clsx(
            "font-semibold text-slate-900 mb-1 truncate", 
            isMobile ? "text-base" : (isDetailOpen ? "text-sm" : "text-lg")
          )}>
            {note.title || "Untitled Note"}
          </h2>

          {!isDetailOpen && (
            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
              {note.desc ? stripHtml(note.desc) : "No content..."}
            </p>
          )}

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{note.time}</span>
            
            <div className={clsx(
              "flex items-center gap-1 transition-opacity",
              isMobile ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}>
              <button
                onClick={(e) => { e.stopPropagation(); toggleHighlight(note); }}
                className={clsx(
                  "p-1.5 rounded-md transition-colors",
                  note.highlight ? "bg-amber-100 text-amber-600" : "hover:bg-slate-100 text-slate-400"
                )}
              >
                <div className={clsx("w-3 h-3 rounded-full border-2", note.highlight ? "bg-amber-500 border-amber-500" : "border-current")} />
              </button>

              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
              >
                {copied ? <Check size={14} className="text-green-600" /> : <Link2 size={14} />}
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); duplicateNote(note); }}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-black transition-colors"
              >
                <Copy size={14} />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={14} />
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
  toggleHighlight,
  isDetailOpen,
  activeNoteId,
  onBack,
  onRenameWorkspace,
  onReorderNotes,
  isMobile = false,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(workspace || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTempName(workspace || ""); }, [workspace]);

  const handleSave = () => {
    if (tempName.trim() && tempName !== workspace) onRenameWorkspace(workspaceId, tempName);
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (n.desc && n.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();

  return (
    <motion.div 
      layout
      className={clsx(
        "relative h-full w-full overflow-y-auto bg-white border-r transition-colors",
        isDetailOpen ? "px-4 py-6" : "px-6 md:px-10 py-10"
      )}
    >
      {!isDetailOpen && (
        <>
          <div className="flex items-center justify-between mb-10">
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} className="text-slate-500" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  placeholder="Search notes..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-slate-200 w-40 md:w-60 transition-all" 
                />
              </div>
              <button onClick={createNote} className="p-2 bg-black text-white rounded-full hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{folder}</span>
            </div>
            {isEditing ? (
              <input 
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                className="text-4xl font-bold outline-none bg-slate-50 px-2 rounded-lg w-full"
              />
            ) : (
              <h1 onClick={() => setIsEditing(true)} className="text-4xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-slate-600 transition-colors">
                {workspace || "Untitled"}
              </h1>
            )}
            <p className="text-slate-400 text-sm mt-2 font-medium">{filteredNotes.length} notes found</p>
          </div>
        </>
      )}

      <div className="pb-24">
        {filteredNotes.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
            <p className="text-slate-400 text-sm">No notes found.</p>
          </div>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={notes} 
            onReorder={onReorderNotes} 
            className="space-y-4"
          >
            <AnimatePresence initial={false}>
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isActive={activeNoteId === note.id}
                  isDetailOpen={isDetailOpen}
                  onNoteClick={(n) => onNoteClick(n)}
                  duplicateNote={duplicateNote}
                  deleteNote={deleteNote}
                  toggleHighlight={toggleHighlight}
                  stripHtml={stripHtml}
                  folder={folder}
                  workspace={workspace}
                  isMobile={isMobile}
                  isSearching={!!searchQuery}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
        )}
      </div>
    </motion.div>
  );
}
