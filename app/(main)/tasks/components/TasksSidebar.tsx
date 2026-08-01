"use client";

import {
  Layers,
  Download,
  Trash2,
  ListTodo,
  Megaphone,
  Music,
  HelpCircle,
  LayoutGrid,
  Code2,
  Plus,
  ChevronDown,
  Hash,
  Kanban,
  LucideIcon,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import CreateWorkspacePopover from "../../notes/components/CreateWorkspacePopover";
import ItemActionMenu from "../../notes/components/ItemActionMenu";
import { TaskProjectSummary } from "./TaskProjectDashboard";

const DEFAULT_PROJECT_ICONS: Record<string, LucideIcon> = {
  Tasks: ListTodo,
  Projects: Kanban,
  Announcements: Megaphone,
  Music: Music,
  Questions: HelpCircle,
  Dashboard: LayoutGrid,
  Development: Code2,
};

const mainMenu = [
  { label: "Tasks", icon: ListTodo },
  { label: "Archive", icon: Download },
  { label: "Trash", icon: Trash2 },
];

export type WorkspaceLink = { id: string; name: string; icon: LucideIcon };

type TasksSidebarProps = {
  workspaces: WorkspaceLink[];
  activeWorkspaceId: string | null;
  activeProjectId: string;
  projects: TaskProjectSummary[];
  onWorkspaceSelect: (id: string) => void;
  onProjectSelect: (id: string) => void;
  onCreateProject: (name: string, icon: LucideIcon) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
};

export default function TasksSidebar({
  workspaces,
  activeWorkspaceId,
  activeProjectId,
  projects,
  onWorkspaceSelect,
  onProjectSelect,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}: TasksSidebarProps) {
  const [activeMain, setActiveMain] = useState<string>("Tasks");
  const [workspacePopoverOpen, setWorkspacePopoverOpen] = useState(false);
  const [projectPopoverOpen, setProjectPopoverOpen] = useState(false);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const displayWorkspaceName = activeWorkspace?.name || "Select Workspace";

  return (
    <aside className="h-full w-[240px] bg-white border-r border-slate-200 flex flex-col justify-between z-20 flex-shrink-0">
      <div>
        {/* WORKSPACE SWITCHER (global, shared with Notes) */}
        <Popover open={workspacePopoverOpen} onOpenChange={setWorkspacePopoverOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-6 w-full hover:bg-slate-50 transition text-left">
              <Layers className={clsx("w-6 h-6 flex-shrink-0", activeWorkspaceId ? "text-blue-500" : "text-slate-400")} />
              <span className={clsx("font-medium truncate", activeWorkspaceId ? "text-slate-800" : "text-slate-400")}>
                {displayWorkspaceName}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
            </button>
          </PopoverTrigger>

          <PopoverContent side="bottom" align="center" sideOffset={4} className="w-[216px] p-2 bg-white shadow-md border rounded-xl">
            <div className="max-h-48 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onWorkspaceSelect(ws.id);
                    setWorkspacePopoverOpen(false);
                  }}
                  className={clsx(
                    "flex-1 flex items-center gap-2 px-3 py-2 text-left truncate w-full rounded-md text-sm transition",
                    activeWorkspaceId === ws.id ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <ws.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
              {workspaces.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400 italic">No workspaces yet — create one from Notes.</p>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* MAIN MENU */}
        <nav className="px-3">
          {mainMenu.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveMain(item.label)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all",
                activeMain === item.label ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* PROJECT LIST */}
        {activeWorkspaceId && (
          <>
            <div className="mt-6 px-5 text-xs font-semibold text-slate-400 tracking-wide flex items-center justify-between">
              PROJECTS
              <Popover open={projectPopoverOpen} onOpenChange={setProjectPopoverOpen}>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-slate-200 rounded-md transition">
                    <Plus className="w-4 h-4 text-slate-600" />
                  </button>
                </PopoverTrigger>
                <CreateWorkspacePopover
                  itemLabel="Project"
                  onCreate={(project) => {
                    onCreateProject(project.label, project.icon);
                    setProjectPopoverOpen(false);
                  }}
                />
              </Popover>
            </div>

            <nav className="mt-2 px-3 pb-20 overflow-y-auto max-h-[calc(100vh-300px)]">
              {projects.length === 0 ? (
                <p className="px-3 text-xs text-slate-400 italic mt-2">No projects yet.</p>
              ) : (
                projects.map((project) => {
                  const isActive = activeProjectId === project.id;
                  const Icon = project.icon || DEFAULT_PROJECT_ICONS[project.name] || Hash;

                  return (
                    <div
                      key={project.id}
                      className={clsx(
                        "group flex items-center w-full rounded-md text-sm transition-all pr-1",
                        isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <button
                        onClick={() => onProjectSelect(project.id)}
                        className="flex-1 flex items-center gap-3 px-3 py-2 text-left truncate"
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{project.name}</span>
                      </button>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ItemActionMenu
                          itemName={project.name}
                          itemType="Project"
                          onRename={(newName) => onRenameProject(project.id, newName)}
                          onDelete={() => onDeleteProject(project.id)}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </nav>
          </>
        )}
      </div>

      <div className="p-4 border-t border-slate-200">
        <button className="w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 transition">
          <Plus className="w-4 h-4" />
          Quick Task
        </button>
      </div>
    </aside>
  );
}
