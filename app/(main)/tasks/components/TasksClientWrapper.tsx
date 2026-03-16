"use client";

import { 
  Calendar as CalendarIcon, 
  Folder, 
  LucideIcon, 
  Layout, 
  Columns, 
  List, 
  Clock 
} from "lucide-react";
import TasksSidebar from "./TasksSidebar";
import TasksKanbanBoard from "./TasksKanbanBoard";
import TasksTable from "./TasksTable";
import TasksTimeline from "./TasksTimeline";
import ProjectHeader from "./ProjectHeader";
import { initialTasksData, initialFolders, defaultColumns } from "./task-data";
import { TasksDataStructure, TaskItem, FolderItem, KanbanColumn, ProjectData } from "./task-types";
import TaskFolderDashboard from "./TaskFolderDashboard";
import TaskProjectDashboard from "./TaskProjectDashboard";
import TaskDetailSidebar from "./TaskDetailSidebar";
import AddTaskModal from "./AddTaskModal";
import clsx from "clsx";
import { useState } from "react";

type ViewMode = "kanban" | "table" | "timeline";

export default function TasksClientWrapper() {
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders);
  const [projectIcons, setProjectIcons] = useState<Record<string, LucideIcon>>({});
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<string>("");
  const [tasksData, setTasksData] = useState<TasksDataStructure>(initialTasksData);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  
  // Sidebar states
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  // Add Task Modal states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<string | undefined>(undefined);

  // --- HELPERS ---
  const getCurrentProjects = (): string[] => {
    if (!activeFolder) return [];
    return Object.keys(tasksData[activeFolder] || {});
  };

  const getCurrentProjectData = () => {
    if (!activeFolder || !activeProject) return { columns: [], tasks: [] };
    return tasksData[activeFolder]?.[activeProject] || { columns: defaultColumns, tasks: [] };
  };

  // --- HANDLERS ---
  const handleTaskClick = (task: TaskItem) => {
    setSelectedTask(task);
    setIsRightSidebarOpen(true);
  };

  const handleOpenAddTask = (status?: string) => {
    setDefaultTaskStatus(status);
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (taskData: Omit<TaskItem, "id">) => {
    if (!activeFolder || !activeProject) return;
    
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
    };

    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          tasks: [newTask, ...prev[activeFolder][activeProject].tasks],
        }
      },
    }));
  };

  const handleUpdateTask = (updatedTask: TaskItem) => {
    if (!activeFolder || !activeProject) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          tasks: prev[activeFolder][activeProject].tasks.map((t) =>
            t.id === updatedTask.id ? updatedTask : t
          ),
        }
      },
    }));
    setSelectedTask(updatedTask);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!activeFolder || !activeProject) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          tasks: prev[activeFolder][activeProject].tasks.filter((t) => t.id !== taskId),
        }
      },
    }));
    setSelectedTask(null);
  };

  const handleBackToFolders = () => {
    setActiveFolder(null);
    setActiveProject("");
  };

  const handleCreateFolder = (name: string) => {
    if (folders.some((f) => f.name === name)) return;
    setFolders((prev) => [...prev, { name, icon: Folder }]);
    setTasksData((prev) => ({ ...prev, [name]: {} }));
    setActiveFolder(name);
    setActiveProject("");
  };

  const handleCreateProject = (name: string, icon: LucideIcon) => {
    if (!activeFolder) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: { 
        ...prev[activeFolder], 
        [name]: { columns: [...defaultColumns], tasks: [] } 
      },
    }));
    setProjectIcons((prev) => ({ ...prev, [name]: icon }));
    setActiveProject(name);
  };

  const handleRenameProject = (oldName: string, newName: string) => {
    if (!activeFolder || !newName.trim() || oldName === newName) return;
    setTasksData((prev) => {
      const folderData = prev[activeFolder];
      const { [oldName]: dataToMove, ...rest } = folderData;
      return { ...prev, [activeFolder]: { ...rest, [newName]: dataToMove } };
    });
    if (activeProject === oldName) setActiveProject(newName);
  };

  const handleDeleteProject = (name: string) => {
    if (!activeFolder) return;
    setTasksData((prev) => {
      const folderData = { ...prev[activeFolder] };
      delete folderData[name];
      return { ...prev, [activeFolder]: folderData };
    });
    if (activeProject === name) setActiveProject("");
  };

  const handleRenameFolder = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return;
    if (folders.some((f) => f.name === newName)) return;
    setFolders((prev) =>
      prev.map((f) => (f.name === oldName ? { ...f, name: newName } : f))
    );
    setTasksData((prev) => {
      const { [oldName]: content, ...rest } = prev;
      return { ...rest, [newName]: content || {} };
    });
    if (activeFolder === oldName) setActiveFolder(newName);
  };

  const handleDeleteFolder = (folderName: string) => {
    setFolders((prev) => prev.filter((f) => f.name !== folderName));
    setTasksData((prev) => {
      const { [folderName]: __delete, ...rest } = prev;
      void __delete;
      return rest;
    });
    if (activeFolder === folderName) {
      setActiveFolder(null);
      setActiveProject("");
    }
  };

  const handleTasksChange = (newTasks: TaskItem[]) => {
    if (!activeFolder || !activeProject) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          tasks: newTasks
        },
      },
    }));
  };

  const handleColumnsChange = (newColumns: KanbanColumn[]) => {
    if (!activeFolder || !activeProject) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          columns: newColumns
        },
      },
    }));
  };

  const handleUpdateProject = (updates: Partial<ProjectData>) => {
    if (!activeFolder || !activeProject) return;
    setTasksData((prev) => ({
      ...prev,
      [activeFolder]: {
        ...prev[activeFolder],
        [activeProject]: {
          ...prev[activeFolder][activeProject],
          ...updates
        },
      },
    }));
  };

  const projectData = getCurrentProjectData();

  const viewOptions = [
    { id: "kanban", icon: Columns, label: "Kanban" },
    { id: "table", icon: List, label: "Table" },
    { id: "timeline", icon: Clock, label: "Timeline" },
  ];

  return (
    <div className="flex h-full w-full overflow-hidden">
      <TasksSidebar
        folders={folders}
        activeFolder={activeFolder}
        activeProject={activeProject}
        projects={getCurrentProjects()}
        customIcons={projectIcons}
        onFolderSelect={setActiveFolder}
        onProjectSelect={setActiveProject}
        onCreateFolder={handleCreateFolder}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
        onRenameFolder={handleRenameFolder}
        onDeleteFolder={handleDeleteFolder}
      />

      <main className="flex-1 h-full overflow-hidden flex flex-col min-w-0">
        {!activeFolder ? (
          <TaskFolderDashboard
            folders={folders}
            onSelect={setActiveFolder}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
          />
        ) : activeProject === "" ? (
          <TaskProjectDashboard
            workspaces={getCurrentProjects()}
            onSelect={setActiveProject}
            onBack={handleBackToFolders}
            onRenameWorkspace={handleRenameProject}
            onDeleteWorkspace={handleDeleteProject}
          />
        ) : (
          <div className="h-full flex flex-col">
             <ProjectHeader 
               projectName={activeProject}
               folderName={activeFolder}
               projectData={projectData}
               onUpdateProject={handleUpdateProject}
             />

             {/* Toolbar */}
             <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-6">
                   {/* View Switcher */}
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                      {viewOptions.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setViewMode(opt.id as ViewMode)}
                          className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                            viewMode === opt.id 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
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
             
             {/* Render View */}
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

      {isRightSidebarOpen && (
        <TaskDetailSidebar 
          task={selectedTask}
          columns={projectData.columns}
          onClose={() => {
            if (selectedTask) setSelectedTask(null);
            else setIsRightSidebarOpen(false);
          }}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
        />
      )}

      <AddTaskModal 
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleAddTask}
        columns={projectData.columns}
        defaultStatus={defaultTaskStatus}
      />
    </div>
  );
}
