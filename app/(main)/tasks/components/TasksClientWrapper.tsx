"use client";

import {
  Layers,
  LucideIcon,
  Layout,
  Columns,
  List,
  Clock,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import TasksSidebar from "./TasksSidebar";
import TasksKanbanBoard from "./TasksKanbanBoard";
import TasksTable from "./TasksTable";
import TasksTimeline from "./TasksTimeline";
import ProjectHeader from "./ProjectHeader";
import { TaskItem, KanbanColumn, ProjectData } from "./task-types";
import WorkspaceDashboard from "../../notes/components/WorkspaceDashboard";
import TaskProjectDashboard, { TaskProjectSummary } from "./TaskProjectDashboard";
import TaskDetailSidebar from "./TaskDetailSidebar";
import AddTaskModal from "./AddTaskModal";
import { NoteService } from "../../notes/services/note-service";
import { getIconByName, getIconName } from "../../notes/utils/icon-utils";
import { TaskService, ApiTask, mapApiTask, mapApiProject } from "../services/task-service";
import clsx from "clsx";

type ViewMode = "kanban" | "table" | "timeline";
type WorkspaceLink = { id: string; name: string; icon: LucideIcon };

export default function TasksClientWrapper() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeWorkspaceId = searchParams.get("workspace");
  const activeProjectId = searchParams.get("project") || "";

  const navigateTo = useCallback((params: { workspace?: string | null; project?: string | null }) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (params.workspace !== undefined) {
      if (params.workspace) newParams.set("workspace", params.workspace);
      else newParams.delete("workspace");
    }
    if (params.project !== undefined) {
      if (params.project) newParams.set("project", params.project);
      else newParams.delete("project");
    }
    router.push(`${pathname}?${newParams.toString()}`);
  }, [pathname, router, searchParams]);

  const [workspaces, setWorkspaces] = useState<WorkspaceLink[]>([]);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

  const [projects, setProjects] = useState<TaskProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loadingProjectData, setLoadingProjectData] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<string | undefined>(undefined);

  // --- Fetch workspaces (global, shared with Notes) ---
  useEffect(() => {
    let mounted = true;
    setLoadingWorkspaces(true);
    NoteService.getAll()
      .then((data) => {
        if (!mounted) return;
        setWorkspaces(data.map((ws) => ({ id: ws.id, name: ws.name, icon: ws.icon_name ? getIconByName(ws.icon_name) : Layers })));
      })
      .catch(() => mounted && setWorkspaces([]))
      .finally(() => mounted && setLoadingWorkspaces(false));
    return () => { mounted = false; };
  }, []);

  // --- Fetch projects for the active workspace ---
  useEffect(() => {
    if (!activeWorkspaceId) {
      setProjects([]);
      return;
    }
    let mounted = true;
    setLoadingProjects(true);
    TaskService.getProjects(activeWorkspaceId)
      .then((data) => {
        if (!mounted) return;
        setProjects(data.map((p) => ({
          id: p.id,
          name: p.name,
          icon: p.icon_name ? getIconByName(p.icon_name) : undefined,
          tasksCount: p.tasks_count,
        })));
      })
      .catch(() => mounted && setProjects([]))
      .finally(() => mounted && setLoadingProjects(false));
    return () => { mounted = false; };
  }, [activeWorkspaceId]);

  // --- Fetch full project (columns + tasks) for the active project ---
  const refetchProjectData = useCallback(() => {
    if (!activeProjectId) {
      setProjectData(null);
      return;
    }
    setLoadingProjectData(true);
    TaskService.getProject(activeProjectId)
      .then((p) => setProjectData(mapApiProject(p)))
      .catch(() => setProjectData(null))
      .finally(() => setLoadingProjectData(false));
  }, [activeProjectId]);

  useEffect(() => {
    refetchProjectData();
  }, [refetchProjectData]);

  // --- Replace a single task in local state after any mutation ---
  const replaceTask = useCallback((apiTask: ApiTask) => {
    const mapped = mapApiTask(apiTask);
    setProjectData((prev) => prev ? { ...prev, tasks: prev.tasks.map((t) => (t.id === mapped.id ? mapped : t)) } : prev);
    setSelectedTask((prev) => (prev && prev.id === mapped.id ? mapped : prev));
  }, []);

  // --- Workspace handlers (delegate to Notes' global workspace API) ---
  const handleCreateWorkspace = useCallback(async (name: string) => {
    const ws = await NoteService.createWorkspace(name);
    setWorkspaces((prev) => [...prev, { id: ws.id, name: ws.name, icon: ws.icon_name ? getIconByName(ws.icon_name) : Layers }]);
    navigateTo({ workspace: ws.id, project: "" });
  }, [navigateTo]);

  const handleRenameWorkspace = useCallback(async (id: string, name: string) => {
    const ws = workspaces.find((w) => w.id === id);
    await NoteService.updateWorkspace(id, name, ws ? getIconName(ws.icon) : undefined);
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, name } : w)));
  }, [workspaces]);

  const handleDeleteWorkspace = useCallback(async (id: string) => {
    await NoteService.deleteWorkspace(id);
    setWorkspaces((prev) => prev.filter((w) => w.id !== id));
    if (activeWorkspaceId === id) navigateTo({ workspace: null, project: null });
  }, [activeWorkspaceId, navigateTo]);

  // --- Project handlers ---
  const handleCreateProject = useCallback(async (name: string, icon: LucideIcon) => {
    if (!activeWorkspaceId) return;
    const project = await TaskService.createProject(activeWorkspaceId, name, undefined, getIconName(icon));
    setProjects((prev) => [...prev, { id: project.id, name: project.name, icon, tasksCount: 0 }]);
    navigateTo({ project: project.id });
  }, [activeWorkspaceId, navigateTo]);

  const handleRenameProject = useCallback(async (id: string, name: string) => {
    await TaskService.updateProject(id, { name });
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }, []);

  const handleDeleteProject = useCallback(async (id: string) => {
    await TaskService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) navigateTo({ project: null });
  }, [activeProjectId, navigateTo]);

  const handleUpdateProject = useCallback(async (updates: Partial<ProjectData>) => {
    if (!activeProjectId) return;
    await TaskService.updateProject(activeProjectId, {
      description: updates.description,
      status: updates.status,
      start_date: updates.startDate ? `${updates.startDate}T00:00:00` : undefined,
      end_date: updates.endDate ? `${updates.endDate}T00:00:00` : undefined,
      metadata: updates.metadata,
    });
    setProjectData((prev) => (prev ? { ...prev, ...updates } : prev));
  }, [activeProjectId]);

  // --- Task handlers ---
  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsRightSidebarOpen(true);
  };

  const handleOpenAddTask = (status?: string) => {
    setDefaultTaskStatus(status);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = useCallback(async (taskData: Omit<TaskItem, "id">) => {
    if (!activeProjectId) return;
    const apiTask = await TaskService.createTask({
      project_id: activeProjectId,
      column_id: taskData.status,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      start_date: taskData.startDate,
      due_date: taskData.dueDate,
    });
    setProjectData((prev) => (prev ? { ...prev, tasks: [mapApiTask(apiTask), ...prev.tasks] } : prev));
    setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? { ...p, tasksCount: (p.tasksCount ?? 0) + 1 } : p)));
  }, [activeProjectId]);

  const handleUpdateTaskFields = useCallback(async (taskId: string, fields: Partial<{
    title: string; description: string | null; priority: "low" | "medium" | "high";
    column_id: string; start_date: string | null; due_date: string | null; progress: number;
  }>) => {
    const apiTask = await TaskService.updateTask(taskId, fields);
    replaceTask(apiTask);
  }, [replaceTask]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    await TaskService.deleteTask(taskId);
    setProjectData((prev) => (prev ? { ...prev, tasks: prev.tasks.filter((t) => t.id !== taskId) } : prev));
    setSelectedTask(null);
  }, []);

  const handleTasksChange = useCallback((newTasks: TaskItem[]) => {
    setProjectData((prev) => (prev ? { ...prev, tasks: newTasks } : prev));
    const byColumn = new Map<string, TaskItem[]>();
    newTasks.forEach((t) => {
      const list = byColumn.get(t.status) || [];
      list.push(t);
      byColumn.set(t.status, list);
    });
    const payload: { id: string; column_id: string; order_index: number }[] = [];
    byColumn.forEach((tasks, columnId) => {
      tasks.forEach((t, index) => payload.push({ id: t.id, column_id: columnId, order_index: index }));
    });
    TaskService.reorderTasks(payload).catch(() => {});
  }, []);

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    // Column CRUD isn't persisted yet — default columns (To Do / In Progress / Done)
    // are created server-side when a project is made.
    setProjectData((prev) => (prev ? { ...prev, columns: newColumns } : prev));
  };

  // --- Subtask / comment / attachment / assignee handlers (Task Detail) ---
  const handleAddSubtask = useCallback(async (taskId: string, title: string) => {
    replaceTask(await TaskService.addSubtask(taskId, title));
  }, [replaceTask]);

  const handleToggleSubtask = useCallback(async (subtaskId: string, completed: boolean) => {
    replaceTask(await TaskService.updateSubtask(subtaskId, { completed }));
  }, [replaceTask]);

  const handleDeleteSubtask = useCallback(async (subtaskId: string) => {
    replaceTask(await TaskService.deleteSubtask(subtaskId));
  }, [replaceTask]);

  const handleAddComment = useCallback(async (taskId: string, data: { body?: string; image_url?: string; image_name?: string }) => {
    replaceTask(await TaskService.addComment(taskId, data));
  }, [replaceTask]);

  const handleTogglePinComment = useCallback(async (commentId: string, pinned: boolean) => {
    replaceTask(await TaskService.toggleCommentPin(commentId, pinned));
  }, [replaceTask]);

  const handleAddAttachment = useCallback(async (taskId: string, data: { name: string; url: string; extension?: string; size?: number }) => {
    replaceTask(await TaskService.addAttachment(taskId, data));
  }, [replaceTask]);

  const handleDeleteAttachment = useCallback(async (attachmentId: string) => {
    replaceTask(await TaskService.deleteAttachment(attachmentId));
  }, [replaceTask]);

  const handleAddAssignee = useCallback(async (taskId: string, userId: number) => {
    replaceTask(await TaskService.addAssignee(taskId, userId));
  }, [replaceTask]);

  const handleRemoveAssignee = useCallback(async (taskId: string, userId: number) => {
    replaceTask(await TaskService.removeAssignee(taskId, userId));
  }, [replaceTask]);

  const viewOptions = [
    { id: "kanban", icon: Columns, label: "Kanban" },
    { id: "table", icon: List, label: "Table" },
    { id: "timeline", icon: Clock, label: "Timeline" },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      {activeWorkspaceId && (
        <TasksSidebar
          workspaces={workspaces}
          activeWorkspaceId={activeWorkspaceId}
          activeProjectId={activeProjectId}
          projects={projects}
          onWorkspaceSelect={(id) => navigateTo({ workspace: id, project: "" })}
          onProjectSelect={(id) => navigateTo({ project: id })}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
        />
      )}

      <main className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
        {loadingWorkspaces ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30 animate-pulse">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
              <span className="text-sm font-medium text-slate-400">Syncing workspaces...</span>
            </div>
          </div>
        ) : !activeWorkspaceId ? (
          <WorkspaceDashboard
            workspaces={workspaces}
            onSelect={(id) => navigateTo({ workspace: id, project: "" })}
            onRenameWorkspace={handleRenameWorkspace}
            onDeleteWorkspace={handleDeleteWorkspace}
            onCreateWorkspace={handleCreateWorkspace}
            subtitle="Choose a workspace to view your projects."
          />
        ) : activeProjectId === "" ? (
          loadingProjects ? (
            <div className="flex-1 flex items-center justify-center bg-slate-50/30 animate-pulse">
              <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
            </div>
          ) : (
            <TaskProjectDashboard
              projects={projects}
              onSelect={(id) => navigateTo({ project: id })}
              onBack={() => navigateTo({ workspace: null, project: null })}
              onRenameProject={handleRenameProject}
              onDeleteProject={handleDeleteProject}
              onCreateProject={handleCreateProject}
            />
          )
        ) : loadingProjectData || !projectData ? (
          <div className="flex-1 flex items-center justify-center bg-slate-50/30 animate-pulse">
            <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <ProjectHeader
              projectName={projects.find((p) => p.id === activeProjectId)?.name || ""}
              folderName={workspaces.find((w) => w.id === activeWorkspaceId)?.name || ""}
              projectData={projectData}
              onUpdateProject={handleUpdateProject}
            />

            <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  {viewOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setViewMode(opt.id as ViewMode)}
                      className={clsx(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        viewMode === opt.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      <opt.icon className="w-3.5 h-3.5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className={clsx(
                    "p-2 rounded-lg border transition",
                    isRightSidebarOpen ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-white border-slate-200 text-slate-400"
                  )}
                >
                  <Layout className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleOpenAddTask()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                >
                  New Task
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {viewMode === "kanban" && (
                <TasksKanbanBoard
                  columns={projectData.columns}
                  tasks={projectData.tasks}
                  onTasksChange={handleTasksChange}
                  onColumnsChange={handleColumnsChange}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleOpenAddTask}
                />
              )}
              {viewMode === "table" && (
                <TasksTable
                  columns={projectData.columns}
                  tasks={projectData.tasks}
                  onTaskClick={handleTaskClick}
                  onDeleteTask={handleDeleteTask}
                  onAddTask={handleOpenAddTask}
                />
              )}
              {viewMode === "timeline" && (
                <TasksTimeline
                  columns={projectData.columns}
                  tasks={projectData.tasks}
                  onTaskClick={handleTaskClick}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {isRightSidebarOpen && activeProjectId && (
        <TaskDetailSidebar
          task={selectedTask}
          columns={projectData?.columns || []}
          onClose={() => {
            setSelectedTask(null);
            setIsRightSidebarOpen(false);
          }}
          onUpdateTaskFields={handleUpdateTaskFields}
          onDeleteTask={handleDeleteTask}
          onAddSubtask={handleAddSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onAddComment={handleAddComment}
          onTogglePinComment={handleTogglePinComment}
          onAddAttachment={handleAddAttachment}
          onDeleteAttachment={handleDeleteAttachment}
          onAddAssignee={handleAddAssignee}
          onRemoveAssignee={handleRemoveAssignee}
        />
      )}

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleAddTask}
        columns={projectData?.columns || []}
        defaultStatus={defaultTaskStatus}
      />
    </div>
  );
}
