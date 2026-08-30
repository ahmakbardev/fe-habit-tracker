// app/(main)/tasks/services/task-service.ts
import api from "@/lib/axios";
import { resolveAvatarUrl } from "@/lib/profile-service";
import { format, parseISO, isValid } from "date-fns";
import {
  TaskItem,
  KanbanColumn,
  ProjectData,
  Subtask,
  TaskAttachment,
  TaskComment,
  ActivityEntry,
  Assignee,
  TaskNote,
} from "../components/task-types";

export interface ApiUser {
  id: number;
  name: string;
  avatar_url?: string | null;
}

export interface ApiTaskProject {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  icon_name: string | null;
  status: "planning" | "active" | "on-hold" | "completed";
  start_date: string | null;
  end_date: string | null;
  metadata: { owner?: string; targetDate?: string; priority?: "low" | "medium" | "high" } | null;
  order_index: number;
  tasks_count?: number;
  columns?: ApiTaskColumn[];
}

export interface ApiTaskColumn {
  id: string;
  project_id: string;
  title: string;
  order_index: number;
  tasks?: ApiTask[];
}

export interface ApiTaskSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | null;
  due_date: string | null;
  assignee: ApiUser | null;
}

export interface ApiTaskNote {
  id: string;
  note_id: string;
  title: string;
  folder_id: string;
  workspace_id: string | null;
}

export interface ApiTaskAttachment {
  id: string;
  task_id: string;
  name: string;
  url: string;
  type: "file" | "url" | null;
  extension: string | null;
  size: number | null;
}

export interface ApiTaskComment {
  id: string;
  task_id: string;
  body: string;
  image_url: string | null;
  image_name: string | null;
  pinned: boolean;
  created_at: string;
  user: ApiUser;
}

export interface ApiTaskActivity {
  id: string;
  task_id: string;
  message: string;
  created_at: string;
}

export interface ApiTask {
  id: string;
  project_id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "low" | "medium" | "high";
  start_date: string | null;
  due_date: string | null;
  tags: string[] | null;
  progress: number;
  created_at: string;
  subtasks: ApiTaskSubtask[];
  attachments: ApiTaskAttachment[];
  comments: ApiTaskComment[];
  activities: ApiTaskActivity[];
  assignees: ApiUser[];
  notes: ApiTaskNote[];
}

const unwrap = <T>(response: { data: unknown }): T => {
  const res = response.data;
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

// --- Date helpers: backend returns full ISO timestamps, the date/time
// pickers in this feature use "YYYY-MM-DD HH:mm" (no timezone). ---
function toLocalDateTimeString(iso: string | null): string | undefined {
  if (!iso) return undefined;
  const date = parseISO(iso);
  if (!isValid(date)) return undefined;
  return format(date, "yyyy-MM-dd HH:mm");
}

function fromLocalDateTimeString(local?: string): string | null {
  if (!local) return null;
  return local.replace(" ", "T");
}

// --- Mapping: API shapes -> local UI shapes (task-types.ts) ---
export function mapApiUser(user: ApiUser): Assignee {
  return { id: String(user.id), name: user.name, avatarUrl: resolveAvatarUrl(user.avatar_url ?? null) };
}

export function mapApiSubtask(s: ApiTaskSubtask): Subtask {
  return {
    id: s.id,
    title: s.title,
    completed: s.completed,
    priority: s.priority,
    dueDate: toLocalDateTimeString(s.due_date) ?? null,
    assignee: s.assignee ? mapApiUser(s.assignee) : null,
  };
}

export function mapApiTaskNote(n: ApiTaskNote): TaskNote {
  return { id: n.id, noteId: n.note_id, title: n.title, folderId: n.folder_id, workspaceId: n.workspace_id };
}

export function mapApiAttachment(a: ApiTaskAttachment): TaskAttachment {
  return {
    id: a.id,
    name: a.name,
    extension: a.extension || "FILE",
    size: a.size ? formatFileSize(a.size) : "",
    url: a.url,
    type: a.type === "url" ? "url" : "file",
  };
}

export function mapApiComment(c: ApiTaskComment): TaskComment {
  return {
    id: c.id,
    author: c.user.name,
    avatarUrl: resolveAvatarUrl(c.user.avatar_url ?? null),
    text: c.body,
    createdAt: c.created_at,
    imageUrl: c.image_url ?? undefined,
    imageName: c.image_name ?? undefined,
    pinned: c.pinned,
  };
}

export function mapApiActivity(a: ApiTaskActivity): ActivityEntry {
  return { id: a.id, message: a.message, createdAt: a.created_at };
}

export function mapApiTask(t: ApiTask): TaskItem {
  return {
    id: t.id,
    title: t.title,
    description: t.description ?? undefined,
    status: t.column_id,
    priority: t.priority,
    startDate: toLocalDateTimeString(t.start_date),
    dueDate: toLocalDateTimeString(t.due_date),
    createdAt: t.created_at,
    tags: t.tags ?? [],
    progress: t.progress,
    assignees: (t.assignees || []).map(mapApiUser),
    attachments: (t.attachments || []).map(mapApiAttachment),
    notes: (t.notes || []).map(mapApiTaskNote),
    subtasks: (t.subtasks || []).map(mapApiSubtask),
    comments: (t.comments || []).map(mapApiComment),
    activities: (t.activities || []).map(mapApiActivity),
  };
}

export function mapApiColumn(c: ApiTaskColumn): KanbanColumn {
  return { id: c.id, title: c.title };
}

export function mapApiProject(p: ApiTaskProject): ProjectData {
  const columns = (p.columns || []).map(mapApiColumn);
  const tasks = (p.columns || []).flatMap((c) => (c.tasks || []).map(mapApiTask));
  return {
    columns,
    tasks,
    description: p.description ?? undefined,
    status: p.status,
    startDate: p.start_date ? p.start_date.slice(0, 10) : undefined,
    endDate: p.end_date ? p.end_date.slice(0, 10) : undefined,
    metadata: p.metadata ?? undefined,
  };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const TaskService = {
  getProjects: async (workspaceId: string): Promise<ApiTaskProject[]> => {
    const response = await api.get(`/tasks?workspace_id=${workspaceId}&t=${Date.now()}`);
    return unwrap(response);
  },

  getProject: async (id: string): Promise<ApiTaskProject> => {
    const response = await api.get(`/tasks/projects/${id}?t=${Date.now()}`);
    return unwrap(response);
  },

  createProject: async (workspace_id: string, name: string, description?: string, icon_name?: string): Promise<ApiTaskProject> => {
    const response = await api.post("/tasks/projects", { workspace_id, name, description, icon_name });
    return unwrap(response);
  },

  updateProject: async (id: string, data: Partial<{
    name: string; description: string | null; icon_name: string | null;
    status: string; start_date: string | null; end_date: string | null;
    metadata: Record<string, unknown>;
  }>): Promise<ApiTaskProject> => {
    const response = await api.patch(`/tasks/projects/${id}`, data);
    return unwrap(response);
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete(`/tasks/projects/${id}`);
  },

  createTask: async (data: {
    project_id: string; column_id: string; title: string; description?: string;
    priority?: "low" | "medium" | "high"; start_date?: string | null; due_date?: string | null;
  }): Promise<ApiTask> => {
    const response = await api.post("/tasks", {
      ...data,
      start_date: fromLocalDateTimeString(data.start_date ?? undefined),
      due_date: fromLocalDateTimeString(data.due_date ?? undefined),
    });
    return unwrap(response);
  },

  updateTask: async (id: string, data: Partial<{
    title: string; description: string | null; priority: "low" | "medium" | "high";
    column_id: string; start_date: string | null; due_date: string | null;
    tags: string[]; progress: number;
  }>): Promise<ApiTask> => {
    const payload: Record<string, unknown> = { ...data };
    if ("start_date" in data) payload.start_date = fromLocalDateTimeString(data.start_date ?? undefined);
    if ("due_date" in data) payload.due_date = fromLocalDateTimeString(data.due_date ?? undefined);
    const response = await api.patch(`/tasks/${id}`, payload);
    return unwrap(response);
  },

  deleteTask: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  reorderTasks: async (tasks: { id: string; column_id: string; order_index: number }[]): Promise<void> => {
    await api.put("/tasks/reorder", { tasks });
  },

  addSubtask: async (taskId: string, title: string): Promise<ApiTask> => {
    const response = await api.post(`/tasks/${taskId}/subtasks`, { title });
    return unwrap(response);
  },

  updateSubtask: async (id: string, data: Partial<{
    title: string; completed: boolean; priority: "low" | "medium" | "high" | null;
    due_date: string | null; assignee_id: number | null;
  }>): Promise<ApiTask> => {
    const payload: Record<string, unknown> = { ...data };
    if ("due_date" in data) payload.due_date = fromLocalDateTimeString(data.due_date ?? undefined);
    const response = await api.patch(`/tasks/subtasks/${id}`, payload);
    return unwrap(response);
  },

  deleteSubtask: async (id: string): Promise<ApiTask> => {
    const response = await api.delete(`/tasks/subtasks/${id}`);
    return unwrap(response);
  },

  convertSubtaskToTask: async (id: string): Promise<{ task: ApiTask; created_task: ApiTask }> => {
    const response = await api.post(`/tasks/subtasks/${id}/convert`);
    return unwrap(response);
  },

  addComment: async (taskId: string, data: { body?: string; image_url?: string; image_name?: string }): Promise<ApiTask> => {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return unwrap(response);
  },

  toggleCommentPin: async (id: string, pinned: boolean): Promise<ApiTask> => {
    const response = await api.patch(`/tasks/comments/${id}`, { pinned });
    return unwrap(response);
  },

  deleteComment: async (id: string): Promise<ApiTask> => {
    const response = await api.delete(`/tasks/comments/${id}`);
    return unwrap(response);
  },

  addAttachment: async (taskId: string, data: { name: string; url: string; type?: "file" | "url"; extension?: string; size?: number }): Promise<ApiTask> => {
    const response = await api.post(`/tasks/${taskId}/attachments`, data);
    return unwrap(response);
  },

  deleteAttachment: async (id: string): Promise<ApiTask> => {
    const response = await api.delete(`/tasks/attachments/${id}`);
    return unwrap(response);
  },

  attachNote: async (taskId: string, noteId: string): Promise<ApiTask> => {
    const response = await api.post(`/tasks/${taskId}/notes`, { note_id: noteId });
    return unwrap(response);
  },

  detachNote: async (id: string): Promise<ApiTask> => {
    const response = await api.delete(`/tasks/notes/${id}`);
    return unwrap(response);
  },

  addAssignee: async (taskId: string, userId: number): Promise<ApiTask> => {
    const response = await api.post(`/tasks/${taskId}/assignees`, { user_id: userId });
    return unwrap(response);
  },

  removeAssignee: async (taskId: string, userId: number): Promise<ApiTask> => {
    const response = await api.delete(`/tasks/${taskId}/assignees/${userId}`);
    return unwrap(response);
  },
};
