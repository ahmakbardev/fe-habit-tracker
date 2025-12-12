"use client";

import { Plus, Copy, Search, ArrowLeft, Trash2 } from "lucide-react";
import type { NoteItem } from "./NotesClientWrapper";
import clsx from "clsx";

type Props = {
  workspace: string;
  notes: NoteItem[];
  onNoteClick: (note: NoteItem) => void;
  createNote: () => void;
  duplicateNote: (note: NoteItem) => void;
  deleteNote: (noteId: string) => void;
  isDetailOpen: boolean;
  activeNoteId?: string | null;
  onBack: () => void;
};

export default function NotesContentPanel({
  workspace,
  notes,
  onNoteClick,
  createNote,
  duplicateNote,
  deleteNote,
  isDetailOpen,
  activeNoteId,
  onBack,
}: Props) {
  const safeWorkspaceName = workspace || "";

  return (
    <div
      className={`
        fixed top-16 left-[240px]
        h-[calc(100vh-64px)] overflow-y-auto
        bg-white transition-all duration-300 py-8
        ${isDetailOpen ? "w-[260px] px-4" : "px-10 w-[calc(100vw-260px)]"}
      `}
    >
      {/* --- HEADER TOOLBAR --- */}
      {!isDetailOpen && (
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-sm text-slate-400 hover:text-slate-800 transition-colors font-medium px-2 py-1.5 -ml-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
              <input
                placeholder="Search notes..."
                className="w-48 sm:w-64 pl-9 pr-4 py-2 bg-slate-50 border border-transparent rounded-full text-sm outline-none focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={createNote}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-200 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Note</span>
            </button>
          </div>
        </div>
      )}

      {/* --- TITLE --- */}
      {!isDetailOpen && (
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
            {safeWorkspaceName}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {notes.length} {notes.length === 1 ? "note" : "notes"} in this
            workspace
          </p>
        </div>
      )}

      {/* --- LIST NOTES --- */}
      <div className="flex flex-col gap-4 pb-20">
        {notes.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <p className="text-slate-400 text-sm font-medium">
              No notes here yet.
            </p>
            <button
              onClick={createNote}
              className="mt-2 text-sm text-black underline underline-offset-4 hover:text-slate-600"
            >
              Create your first note
            </button>
          </div>
        ) : (
          notes.map((note) => {
            const isActive = activeNoteId === note.id;

            return (
              <div
                key={note.id}
                onClick={() => onNoteClick(note)}
                className={clsx(
                  "group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden",
                  isActive
                    ? "ring-2 ring-black border-transparent shadow-md"
                    : "hover:border-slate-300 hover:shadow-md border-slate-200",
                  note.highlight
                    ? "bg-orange-50/50 border-orange-100"
                    : "bg-white",
                  isDetailOpen ? "p-4" : "p-6"
                )}
              >
                <div className="w-full">
                  <h2
                    className={clsx(
                      "font-semibold text-slate-900 mb-2",
                      isDetailOpen ? "text-sm" : "text-lg"
                    )}
                  >
                    {note.title || "Untitled Note"}
                  </h2>

                  {!isDetailOpen && (
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                      {note.desc || "No additional text content..."}
                    </p>
                  )}

                  {/* Footer Meta & Actions */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">
                      {note.time}
                    </span>

                    {/* ACTION BUTTONS GROUP */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Duplicate Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateNote(note);
                        }}
                        className={clsx(
                          "flex items-center gap-1.5 rounded-md transition-colors hover:bg-slate-100",
                          // KONDISI: Jika detail TIDAK buka, tampilkan teks & padding lebih besar
                          !isDetailOpen
                            ? "px-3 py-1.5 text-slate-500 hover:text-black"
                            : "p-1.5 text-slate-400 hover:text-black"
                        )}
                        title="Duplicate"
                      >
                        <Copy
                          className={clsx(
                            !isDetailOpen ? "w-4 h-4" : "w-3.5 h-3.5"
                          )}
                        />
                        {/* Text Label */}
                        {!isDetailOpen && (
                          <span className="text-xs font-medium">Duplicate</span>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className={clsx(
                          "flex items-center gap-1.5 rounded-md transition-colors hover:bg-red-50",
                          // KONDISI: Sama seperti di atas
                          !isDetailOpen
                            ? "px-3 py-1.5 text-slate-500 hover:text-red-600"
                            : "p-1.5 text-slate-400 hover:text-red-600"
                        )}
                        title="Delete"
                      >
                        <Trash2
                          className={clsx(
                            !isDetailOpen ? "w-4 h-4" : "w-3.5 h-3.5"
                          )}
                        />
                        {/* Text Label */}
                        {!isDetailOpen && (
                          <span className="text-xs font-medium">Delete</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
