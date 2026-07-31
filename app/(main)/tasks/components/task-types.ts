// app/(main)/tasks/components/task-types.ts

import { LucideIcon } from "lucide-react";

export type TaskStatus = string; // Dinamis

export type Assignee = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export type Subtask = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
};

export type TaskAttachment = {
  id: string;
  name: string;
  extension: string;
  size: string;
  blobUrl?: string;
};

export type TaskComment = {
  id: string;
  author: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  message: string;
  createdAt: string;
};

export type TaskItem = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus; // Harus match dengan Column ID
  priority: "low" | "medium" | "high";
  startDate?: string;
  dueDate?: string;
  createdAt?: string;
  tags?: string[];
  linkedNoteId?: string;
  progress?: number;
  assignees?: Assignee[];
  attachments?: TaskAttachment[];
  subtasks?: Subtask[];
  comments?: TaskComment[];
  activities?: ActivityEntry[];
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
