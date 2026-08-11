"use client";

import { useEffect, useState } from "react";
import { NoteService } from "../../notes/services/note-service";
import NoteDetailPanel from "../../notes/components/NoteDetailPanel";
import type { NoteItem } from "../../notes/components/NotesClientWrapper";

type Props = {
  noteId: string;
  onBack: () => void;
  onDeleted: (noteId: string) => void;
};

// Note content can be a raw HTML string or a structured { html } / { type: "doc" }
// shape depending on how it was authored — same normalization NotesClientWrapper
// applies when it loads a note detail.
function extractContentHtml(content: unknown, plainTextFallback = ""): string {
  if (!content) return "";
  let html = "";
  if (typeof content === "string") {
    html = content;
  } else if (typeof content === "object" && content !== null) {
    const c = content as { html?: string; type?: string };
    if (c.html) html = c.html;
    else if (c.type === "doc") html = plainTextFallback;
  }
  return html.replace(/src="\/uploads\//g, 'src="https://s3.ahmakbar.space/uploads/');
}

export default function TaskNoteDrawer({ noteId, onBack, onDeleted }: Props) {
  const [note, setNote] = useState<NoteItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(false);
    setNote(null);
    NoteService.getById(noteId)
      .then((n) => {
        if (!mounted) return;
        setNote({
          id: n.id,
          folder_id: n.folder_id,
          title: n.title,
          desc: n.plain_text_preview || "- ",
          time: new Date(n.updated_at).toLocaleDateString(),
          content: extractContentHtml(n.content, n.plain_text_preview),
          highlight: n.highlight,
        });
      })
      .catch(() => mounted && setError(true))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [noteId]);

  const handleUpdate = async (updated: NoteItem) => {
    await NoteService.updateNote(updated.id, { title: updated.title, content: updated.content });
    setNote(updated);
  };

  const handleDelete = async (id: string) => {
    await NoteService.deleteNote(id);
    onDeleted(id);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center text-sm text-slate-400 italic">Memuat note...</div>;
  }

  if (error || !note) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm text-slate-400">Note tidak ditemukan atau sudah dihapus.</p>
        <button onClick={onBack} className="text-xs font-bold text-blue-600 hover:underline">
          Kembali ke task
        </button>
      </div>
    );
  }

  return (
    <NoteDetailPanel
      note={note}
      onClose={onBack}
      onDelete={handleDelete}
      onUpdate={handleUpdate}
      onCreateNew={() => {}}
      closeVariant="back"
      showNewButton={false}
      compact
    />
  );
}
