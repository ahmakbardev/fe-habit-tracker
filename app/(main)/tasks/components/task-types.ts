// app/(main)/tasks/components/task-types.ts

import { LucideIcon } from "lucide-react";

export type TaskStatus = string; // Dinamis

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus; // Harus match dengan Column ID
  priority: "low" | "medium" | "high";
  startDate?: string;
  dueDate?: string;
  tags?: string[];
  linkedNoteId?: string;
};

export type KanbanColumn = {
  id: string;
  title: string;
};

export type ProjectData = {
  columns: KanbanColumn[];
  tasks: TaskItem[];
  description?: string;
  status?: "planning" | "active" | "on-hold" | "completed";
  startDate?: string;
  endDate?: string;
  metadata?: {
    owner?: string;
    targetDate?: string;
    priority?: "low" | "medium" | "high";
  };
};

export type ProjectType = string;
export type FolderType = string;

// Folder -> Project -> { columns, tasks }
export type TasksDataStructure = Record<string, Record<string, ProjectData>>;

export type FolderItem = {
  name: string;
  icon: LucideIcon;
};
