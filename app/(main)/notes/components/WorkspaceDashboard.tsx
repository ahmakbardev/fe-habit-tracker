"use client";

import { useState } from "react";
import {
  ArrowRight,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Check,
  LucideIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ItemActionMenu from "./ItemActionMenu";
import clsx from "clsx";

type Props = {
  workspaces: { id: string; name: string; icon: LucideIcon }[];
  onSelect: (workspaceId: string) => void;
  onRenameWorkspace: (workspaceId: string, newName: string) => void;
  onDeleteWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string) => void;
  subtitle?: string;
};

type ViewMode = "grid" | "list";

export default function WorkspaceDashboard({
  workspaces,
  onSelect,
  onRenameWorkspace,
  onDeleteWorkspace,
  onCreateWorkspace,
  subtitle = "Choose a workspace to view your folders.",
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleCreateSubmit = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setIsPopoverOpen(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-slate-50 p-6 md:p-10 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Select Workspace
            </h1>
            <p className="text-slate-500 text-sm md:text-base">
              {subtitle}
            </p>
          </div>

          <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          className={clsx(
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "flex flex-col gap-2"
          )}
        >
          {workspaces.map((ws) => {
            const Icon = ws.icon;
            return (
              <div
                key={ws.id}
                onClick={() => onSelect(ws.id)}
                className={clsx(
                  "group relative flex items-center justify-between bg-white border border-slate-200 cursor-pointer transition-all hover:border-orange-200 hover:ring-1 hover:ring-orange-200",
                  viewMode === "grid"
                    ? "p-6 rounded-2xl shadow-sm hover:shadow-md h-full"
                    : "px-4 py-3 rounded-xl hover:bg-orange-50/30"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={clsx(
                      "bg-orange-50 text-orange-600 rounded-xl transition-colors group-hover:bg-orange-500 group-hover:text-white",
                      viewMode === "grid" ? "p-3" : "p-2"
                    )}
                  >
                    <Icon
                      className={clsx(
                        viewMode === "grid" ? "w-6 h-6" : "w-5 h-5"
                      )}
                    />
                  </div>
                  <div>
                    <h3
                      className={clsx(
                        "font-semibold text-slate-800 group-hover:text-orange-700 transition-colors",
                        viewMode === "grid" ? "text-base" : "text-sm"
                      )}
                    >
                      {ws.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight
                    className={clsx(
                      "text-slate-300 group-hover:text-orange-500 transition-all",
                      viewMode === "grid"
                        ? "w-5 h-5 group-hover:translate-x-1 group-hover:opacity-0"
                        : "w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                    )}
                  />

                  <div
                    className={clsx(
                      "transition-all",
                      viewMode === "grid"
                        ? "absolute top-6 right-6 opacity-0 group-hover:opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ItemActionMenu
                      itemName={ws.name}
                      itemType="Workspace"
                      onRename={(newName) => onRenameWorkspace(ws.id, newName)}
                      onDelete={() => onDeleteWorkspace(ws.id)}
                      triggerClassName="hover:bg-orange-100 text-slate-400 hover:text-orange-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={clsx(
                  "group flex items-center justify-center border-2 border-dashed border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all text-slate-400 hover:text-orange-500",
                  viewMode === "grid"
                    ? "flex-col gap-3 rounded-2xl py-3 h-full"
                    : "flex-row gap-3 px-4 py-3 rounded-xl w-full"
                )}
              >
                <div className="p-2 bg-slate-100 rounded-full group-hover:bg-white group-hover:shadow-sm transition-all">
                  <Plus
                    className={clsx(
                      viewMode === "grid" ? "w-6 h-6" : "w-4 h-4"
                    )}
                  />
                </div>
                <span className="font-medium text-sm">Create New Workspace</span>
              </button>
            </PopoverTrigger>

            <PopoverContent className="w-64 p-3" align="center">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-slate-900">
                  New Workspace
                </h4>
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
                    placeholder="Workspace name..."
                    className="flex-1 text-sm border rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-orange-500"
                  />
                  <button
                    onClick={handleCreateSubmit}
                    disabled={!newWorkspaceName.trim()}
                    className="bg-black text-white p-1.5 rounded-md hover:opacity-80 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
