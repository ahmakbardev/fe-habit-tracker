// app/(main)/tasks/components/task-types.ts

export type TaskStatus = string; // Dinamis

export type Assignee = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  priority?: "low" | "medium" | "high" | null;
  dueDate?: string | null;
  assignee?: Assignee | null;
};

export type TaskNote = {
  id: string;
  noteId: string;
  title: string;
  folderId: string;
  workspaceId: string | null;
};

export type TaskAttachment = {
  id: string;
  name: string;
  extension: string;
  size: string;
  url?: string;
  type: "file" | "url";
};

export type TaskComment = {
  id: string;
  author: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
  imageUrl?: string;
  imageName?: string;
  pinned?: boolean;
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
  progress?: number;
  assignees?: Assignee[];
  attachments?: TaskAttachment[];
  notes?: TaskNote[];
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

// Flat, cross-project task used by the "Active Tasks" quick board shown on
// the Tasks index — each task carries its own project/workspace so the
// board can flag where it lives and jump straight there when clicked.
export type QuickBoardTask = {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  startDate?: string;
  dueDate?: string;
  tags?: string[];
  assignees?: Assignee[];
  columnId: string;
  columnTitle: string;
  projectId: string;
  projectName: string;
  projectIconName?: string;
  workspaceId: string;
  workspaceName: string;
  workspaceIconName?: string;
};

