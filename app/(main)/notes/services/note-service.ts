// app/(main)/notes/services/note-service.ts
import api from "@/lib/axios";

export interface ApiNote {
  id: string;
  workspace_id: string;
  title: string;
  content: unknown;
  plain_text_preview: string;
  highlight: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiWorkspace {
  id: string;
  folder_id: string;
  name: string;
  icon_name?: string;
  notes: ApiNote[];
  created_at: string;
  updated_at: string;
}

export interface ApiFolder {
  id: string;
  name: string;
  icon_name?: string;
  workspaces: ApiWorkspace[];
  created_at: string;
  updated_at: string;
}

const unwrap = <T>(response: { data: unknown }): T => {
  const res = response.data;
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

export const NoteService = {
  getAll: async (): Promise<ApiFolder[]> => {
    const response = await api.get(`/notes?t=${Date.now()}`);
    return unwrap(response);
  },

  getById: async (id: string): Promise<ApiNote> => {
    const response = await api.get(`/notes/${id}?t=${Date.now()}`);
    return unwrap(response);
  },

  createFolder: async (name: string, icon_name?: string): Promise<ApiFolder> => {
    const response = await api.post("/notes/folders", { name, icon_name });
    return unwrap(response);
  },

  updateFolder: async (id: string, name: string, icon_name?: string): Promise<ApiFolder> => {
    const response = await api.patch(`/notes/folders/${id}`, { name, icon_name });
    return unwrap(response);
  },

  deleteFolder: async (id: string): Promise<void> => {
    await api.delete(`/notes/folders/${id}`);
  },

  createWorkspace: async (folder_id: string, name: string, icon_name?: string): Promise<ApiWorkspace> => {
    const response = await api.post("/notes/workspaces", { folder_id, name, icon_name });
    return unwrap(response);
  },

  updateWorkspace: async (id: string, name: string, icon_name?: string): Promise<ApiWorkspace> => {
    const response = await api.patch(`/notes/workspaces/${id}`, { name, icon_name });
    return unwrap(response);
  },

  deleteWorkspace: async (id: string): Promise<void> => {
    await api.delete(`/notes/workspaces/${id}`);
  },

  createNote: async (workspace_id: string, title: string, content: unknown = {}): Promise<ApiNote> => {
    const response = await api.post("/notes", { workspace_id, title, content });
    return unwrap(response);
  },

  updateNote: async (id: string, data: { title?: string; content?: unknown; plain_text_preview?: string }): Promise<ApiNote> => {
    const response = await api.patch(`/notes/${id}`, data);
    return unwrap(response);
  },

  duplicateNote: async (id: string): Promise<ApiNote> => {
    const response = await api.post(`/notes/${id}/duplicate`);
    return unwrap(response);
  },

  deleteNote: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  uploadMedia: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/notes/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    const resData = response.data;
    
    // Mencari URL absolut. Berdasarkan response user:
    // Top-level 'url' adalah https://s3.ahmakbar.space/uploads/...
    // data.url adalah /uploads/...
    let imageUrl = resData.url;
    
    // Jika tidak ada di top-level, cari di data.url
    if (!imageUrl && resData.data?.url) {
      imageUrl = resData.data.url;
    }

    // Pastikan URL absolut
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = `https://s3.ahmakbar.space${imageUrl}`;
    }

    return {
      url: imageUrl || ""
    };
  },
};
