"use client";

import { X, Trash, Plus } from "lucide-react";
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

  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState<string>(
    typeof note.content === "string" ? note.content : note.desc || ""
  );
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");

  const titleRef = useRef<HTMLInputElement>(null);

  // 1. Effect untuk Reset saat Ganti Note
  useEffect(() => {
    if (prevNoteIdRef.current !== note.id) {
      setTitle(note.title || "");
      setBody(typeof note.content === "string" ? note.content : note.desc || "");
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
      {/* HEADER: Close, Status, Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-1 -ml-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
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
        <div className="flex items-center gap-2">
          <button
            onClick={onCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-black hover:bg-slate-100 rounded-md transition"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>

          <div className="w-px h-4 bg-slate-200 mx-1"></div>

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
