import { Suspense } from "react";
import TasksClientWrapper from "./components/TasksClientWrapper";

export const metadata = {
  title: "Tasks | Habit Tracker",
  description: "Manage your tasks with a Kanban board",
};

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading tasks...</div>}>
      <TasksClientWrapper />
    </Suspense>
  );
}
