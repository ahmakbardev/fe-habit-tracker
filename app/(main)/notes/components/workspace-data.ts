// app/(main)/notes/components/workspace-data.ts
import type { NoteItem } from "./NotesClientWrapper";

// Struktur Baru: Folder -> Workspace -> Notes[]
export type NotesDataStructure = Record<string, Record<string, NoteItem[]>>;

export const initialNotesData: NotesDataStructure = {
  "Awsmd": {
    "Notes": [
      { id: "1", title: "Grocery list", desc: "Bread, Milk...", time: "1 min" },
      { id: "2", title: "Ideas", desc: "App ideas...", time: "5 min", highlight: true },
    ],
    "Tasks": [
      { id: "3", title: "Fix UI", desc: "Sidebar bug", time: "Today", highlight: true },
    ],
    "Dashboard": [],
  },
  "Work Notes": {
    "Meetings": [
      { id: "4", title: "Weekly Sync", desc: "Discuss roadmap", time: "Mon 9am" },
    ],
    "Projects": [],
  },
  "Personal": {
    "Journal": [],
    "Travel Plans": [],
  },
  "Projects": {
    "SaaS App": [],
  },
};