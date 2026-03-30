"use client";

import { X, Trash, Plus, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { NoteItem } from "./NotesClientWrapper";
import RichTextEditor from "./text-editor/RichTextEditor";
import { motion } from "framer-motion";
import clsx from "clsx";

type Props = {
  note: NoteItem;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (note: NoteItem) => Promise<void>; // Ubah ke Promise agar bisa ditunggu
  onCreateNew: () => void;
  isMobile?: boolean;
};

export default function NoteDetailPanel({
  note,
  onClose,
  onDelete,
  onUpdate,
  onCreateNew,
  isMobile = false,
}: Props) {
  // Simpan ID sebelumnya untuk mendeteksi perpindahan note
  const prevNoteIdRef = useRef(note.id);

  // Helper untuk memastikan content adalah string HTML
  const getInitialBody = (note: NoteItem) => {
    if (typeof note.content === "string") return note.content;
    if (note.content && typeof note.content === "object") {
      const c = note.content as { html?: string };
      if (c.html) return c.html;
    }
    return note.desc || "";
  };

  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState<string>(getInitialBody(note));
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const titleRef = useRef<HTMLInputElement>(null);

  // 1. Effect untuk Reset saat Ganti Note
  useEffect(() => {
    if (prevNoteIdRef.current !== note.id) {
      setTitle(note.title || "");
      setBody(getInitialBody(note));
      setSaveStatus("saved");
      prevNoteIdRef.current = note.id;
    }
  }, [note.id, note.title, note.content, note.desc]);

  // 2. [OPTIMIZED] Autosync Effect dengan Debounce 1s & Status Load
  useEffect(() => {
    const isTitleChanged = title !== (note.title || "");
    const currentBody = typeof note.content === "string" ? note.content : note.desc || "";
    const isBodyChanged = body !== currentBody;

    if (isTitleChanged || isBodyChanged) {
      setSaveStatus("unsaved");
      
      const timeoutId = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await onUpdate({
            ...note,
            title,
            content: body,
            desc: body
          });
          setSaveStatus("saved");
        } catch (error) {
          console.error("Auto-save failed:", error);
          setSaveStatus("unsaved");
        }
      }, 1000); // Debounce 1 detik agar lebih responsif

      return () => clearTimeout(timeoutId);
    }
  }, [title, body, note, onUpdate]);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <motion.div
      initial={isMobile ? { opacity: 0 } : { opacity: 0, x: 20 }}
      animate={{ x: 0, opacity: 1 }}
      exit={isMobile ? { opacity: 0 } : { opacity: 0, x: 20 }}
      transition={isMobile ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 30 }}
      className={clsx(
        "bg-white overflow-y-auto outline-none",
        isMobile ? "fixed inset-0 z-[60] p-6" : "relative flex-1 border-l p-10 h-full"
      )}
    >
      {/* HEADER: Close, Status, Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onClose}
            className="p-1 -ml-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            title={isMobile ? "Back" : "Close (Esc)"}
          >
            {isMobile ? <ArrowLeft className="w-6 h-6" /> : <X className="w-6 h-6" />}
          </button>

          {/* SUBTLE SAVE STATUS */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-slate-50 border border-slate-100">
            <div className={clsx(
              "w-1.5 h-1.5 rounded-full transition-colors duration-300",
              saveStatus === "saving" ? "bg-orange-400 animate-pulse" :
              saveStatus === "saved" ? "bg-green-500" : "bg-slate-300"
            )} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Unsaved"}
            </span>
          </div>
        </div>

        {/* KANAN: Actions Group */}
        <div className="flex items-center gap-1 md:gap-2">
          {!isMobile && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-black hover:bg-slate-100 rounded-md transition"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}

          {!isMobile && <div className="w-px h-4 bg-slate-200 mx-1"></div>}

          <button
            onClick={() => onDelete(note.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition"
          >
            <Trash className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* TITLE */}
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        className={clsx(
          "font-bold w-full outline-none pb-2 pt-1 leading-tight mb-4 text-slate-900 placeholder:text-slate-300",
          isMobile ? "text-3xl" : "text-4xl"
        )}
        placeholder="Untitled"
      />

      {/* BODY */}
      <RichTextEditor value={body} onChange={(v) => setBody(v)} />
    </motion.div>
  );
}
