"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronRight, StickyNote } from "lucide-react";

interface Note {
  id: number;
  title: string;
  body: string;
  expanded: boolean;
  color: string;
}

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: 1,
      title: "Meeting Insight",
      body: "Highlight key points for product roadmap next week.",
      expanded: false,
      color: "bg-blue-200",
    },
    {
      id: 2,
      title: "Personal Reminder",
      body: "Drink water every hour during work sprint.",
      expanded: false,
      color: "bg-yellow-200",
    },
    {
      id: 3,
      title: "Ideas",
      body: "Explore animation micro-interactions for habit tracker.",
      expanded: false,
      color: "bg-purple-200",
    },
  ]);

  const toggle = (id: number) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, expanded: !n.expanded } : n))
    );
  };

  const addNote = () => {
    const id = Date.now();
    setNotes((prev) => [
      {
        id,
        title: "Untitled Note",
        body: "Write something...",
        expanded: true,
        color: "bg-slate-200",
      },
      ...prev,
    ]);
  };

  return (
    <div className="rounded-lg border lg:col-span-2 border-slate-100 bg-white p-4 shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Notes
        </h2>

        <button
          onClick={addNote}
          className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-600 text-white rounded-md active:scale-95 transition"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* NOTES LIST */}
      <div className="space-y-2">
        {notes.map((note) => (
          <div
            key={note.id}
            className="border rounded-lg p-3 shadow-sm hover:shadow transition"
          >
            {/* Note Header */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggle(note.id)}
            >
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${note.color}`}></span>
                <p className="font-medium text-slate-800">{note.title}</p>
              </div>

              {note.expanded ? (
                <ChevronDown size={16} className="text-slate-500" />
              ) : (
                <ChevronRight size={16} className="text-slate-500" />
              )}
            </div>

            {/* Expanded Content */}
            {note.expanded && (
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {note.body}
              </p>
            )}
          </div>
        ))}

        {notes.length === 0 && (
          <div className="flex flex-col items-center py-6 text-slate-400">
            <StickyNote size={38} />
            <p className="text-sm mt-2">No notes yet. Add one!</p>
          </div>
        )}
      </div>
    </div>
  );
}
