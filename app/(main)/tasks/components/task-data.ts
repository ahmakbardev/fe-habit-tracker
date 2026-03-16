// app/(main)/tasks/components/task-data.ts
import { Folder } from "lucide-react";
import type { TasksDataStructure, FolderItem, KanbanColumn } from "./task-types";

export const defaultColumns: KanbanColumn[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export const initialFolders: FolderItem[] = [
  { name: "Personal", icon: Folder },
  { name: "Work", icon: Folder },
  { name: "Side Projects", icon: Folder },
];

export const initialTasksData: TasksDataStructure = {
  "Personal": {
    "Daily Habits": {
      description: "Manage your core daily routines and health habits to stay consistent.",
      status: "active",
      startDate: "2026-01-01",
      columns: [...defaultColumns],
      tasks: [
        { id: "1", title: "Morning Exercise", status: "done", priority: "medium", description: "30 mins cardio", startDate: "2026-03-15 07:00", dueDate: "2026-03-15 08:30" },
        { id: "2", title: "Read 10 pages", status: "todo", priority: "low", startDate: "2026-03-15 20:00", dueDate: "2026-03-15 21:00" },
      ]
    },
    "Shopping": {
      description: "Weekly grocery list and essential items to buy.",
      status: "planning",
      columns: [...defaultColumns],
      tasks: [
        { id: "3", title: "Buy groceries", status: "todo", priority: "high", startDate: "2026-03-16 10:00", dueDate: "2026-03-16 12:00" },
      ]
    },
  },
  "Work": {
    "Project Alpha": {
      description: "Primary client project focused on the core product redesign and API migration.",
      status: "active",
      startDate: "2026-03-01",
      endDate: "2026-06-30",
      metadata: { owner: "Alex", priority: "high" },
      columns: [...defaultColumns],
      tasks: [
        { id: "4", title: "UI Design", status: "in-progress", priority: "high", description: "Design the dashboard landing page", startDate: "2026-03-15 09:00", dueDate: "2026-03-17 17:00" },
        { id: "5", title: "API Integration", status: "todo", priority: "medium", startDate: "2026-03-16 13:00", dueDate: "2026-03-18 18:00" },
      ]
    },
    "Meetings": {
      description: "Internal syncs and client coordination meetings.",
      columns: [...defaultColumns],
      tasks: []
    },
  },
  "Side Projects": {
    "Habit Tracker": {
      description: "A personal tool to visualize and track daily goals with multiple views.",
      columns: [
        { id: "backlog", title: "Backlog" },
        { id: "todo", title: "To Do" },
        { id: "in-progress", title: "In Progress" },
        { id: "done", title: "Done" },
      ],
      tasks: [
        { id: "6", title: "Implement Kanban", status: "in-progress", priority: "high" },
        { id: "7", title: "Add Notifications", status: "todo", priority: "medium" },
      ]
    },
  },
};
