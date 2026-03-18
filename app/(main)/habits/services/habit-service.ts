// app/(main)/habits/services/habit-service.ts
import api from "@/lib/axios";

export interface ApiHabit {
  id: string;
  user_id: string;
  name: string;
  icon_type: string;
  color: string;
  schedules: string[];
  goal: number;
  created_at: string;
  updated_at: string;
}

export interface ApiHabitCompletion {
  id: string;
  habit_id: string;
  date: string;
  time_slot: string;
  status: number;
}

export interface HabitStats {
  efficiency: number;
  last_7_days: {
    date: string;
    completed: number;
    total: number;
  }[];
}

const unwrap = <T>(response: { data: unknown }): T => {
  const res = response.data;
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
};

export const HabitService = {
  getAll: async (): Promise<ApiHabit[]> => {
    const response = await api.get("/habits");
    return unwrap(response);
  },

  getCompletions: async (startDate: string, endDate: string): Promise<ApiHabitCompletion[]> => {
    const response = await api.get("/habits/completions", {
      params: { start_date: startDate, end_date: endDate },
    });
    return unwrap(response);
  },

  getStats: async (): Promise<HabitStats> => {
    const response = await api.get("/habits/stats");
    return unwrap(response);
  },

  create: async (data: Partial<ApiHabit>): Promise<ApiHabit> => {
    const response = await api.post("/habits", data);
    return unwrap(response);
  },

  update: async (id: string, data: Partial<ApiHabit>): Promise<ApiHabit> => {
    const response = await api.patch(`/habits/${id}`, data);
    return unwrap(response);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/habits/${id}`);
  },

  toggle: async (habitId: string, date: string, timeSlot: string = "daily"): Promise<ApiHabitCompletion | null> => {
    const response = await api.post("/habits/toggle", {
      habit_id: habitId,
      date,
      time_slot: timeSlot,
    });
    return unwrap(response);
  },

  getEfficiency: async (id: string): Promise<{ efficiency: number }> => {
    const response = await api.get(`/habits/${id}/efficiency`);
    return unwrap(response);
  },
};
