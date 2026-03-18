// app/(main)/notes/components/workspace-data.ts
import type { NoteItem } from "./NotesClientWrapper";

// Struktur Baru: Folder -> Workspace -> Notes[]
export type NotesDataStructure = Record<string, Record<string, NoteItem[]>>;

export const initialNotesData: NotesDataStructure = {};
