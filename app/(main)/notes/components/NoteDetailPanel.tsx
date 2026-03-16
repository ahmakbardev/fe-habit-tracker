"use client";

import { X, Trash, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { NoteItem } from "./NotesClientWrapper";
import RichTextEditor from "./text-editor/RichTextEditor";
import { motion } from "framer-motion";

type Props = {
  note: NoteItem;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (note: NoteItem) => void;
  onCreateNew: () => void;
};

export default function NoteDetailPanel({
  note,
  onClose,
  onDelete,
  onUpdate,
  onCreateNew,
}: Props) {
  // Simpan ID sebelumnya untuk mendeteksi perpindahan note
  const prevNoteIdRef = useRef(note.id);

  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.desc);

  const titleRef = useRef<HTMLInputElement>(null);

  // 1. [FIX] Effect untuk Reset saat Ganti Note
  useEffect(() => {
    // Cek apakah ID note berubah dari render sebelumnya
    if (prevNoteIdRef.current !== note.id) {
      setTitle(note.title);
      setBody(note.desc);
      prevNoteIdRef.current = note.id;
    }
  }, [note.id, note.title, note.desc]);

  // 2. [FIX] Autosync Effect
  useEffect(() => {
    const isTitleChanged = title !== note.title;
    const isBodyChanged = body !== note.desc;

    if (isTitleChanged || isBodyChanged) {
      const timeoutId = setTimeout(() => {
        onUpdate({
          ...note,
          title,
          desc: body,
        });
      }, 500);

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
      layout
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="
        relative flex-1
        h-full
        bg-white border-l p-10
        overflow-y-auto
      "
    >
      {/* HEADER: Close, Actions */}
      <div className="flex items-center justify-between mb-6">
        {/* KIRI: Close */}
        <button
          onClick={onClose}
          className="p-1 -ml-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
          title="Close (Esc)"
        >
          <X className="w-6 h-6" />
        </button>

        {/* KANAN: Actions Group */}
        <div className="flex items-center gap-2">
          {/* Tombol New Note */}
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-black hover:bg-slate-100 rounded-md transition"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1"></div>

          {/* Tombol Delete */}
          <button
            onClick={() => onDelete(note.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition"
          >
            <Trash className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* TITLE */}
      <input
        ref={titleRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleTitleKeyDown}
        className="
          text-4xl font-bold w-full outline-none
          pb-2 pt-1 leading-tight mb-4 text-slate-900 placeholder:text-slate-300
        "
        placeholder="Untitled"
      />

      {/* BODY */}
      <RichTextEditor value={body} onChange={(v) => setBody(v)} />
    </motion.div>
  );
}
