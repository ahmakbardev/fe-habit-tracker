"use client";

import { useState } from "react";
import { Folder, ArrowRight, LayoutGrid, List as ListIcon, ArrowLeft } from "lucide-react";
import ItemActionMenu from "../../notes/components/ItemActionMenu";
import clsx from "clsx";

type Props = {
  workspaces: string[];
  onSelect: (workspace: string) => void;
  onRenameWorkspace: (oldName: string, newName: string) => void;
  onDeleteWorkspace: (wsName: string) => void;
  onBack: () => void;
};

type ViewMode = "grid" | "list";

export default function TaskProjectDashboard({
  workspaces,
  onSelect,
  onRenameWorkspace,
  onDeleteWorkspace,
  onBack,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  return (
    <div className="relative flex-1 h-full w-full bg-slate-50 p-10 overflow-y-auto">
      <div className="mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-black transition-colors font-medium px-2 py-1 -ml-2 rounded-md hover:bg-slate-200/50 w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Folders
          </button>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Projects</h1>
            <p className="text-slate-500">Select a project to manage your tasks.</p>
          </div>

          <div className="flex bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <button onClick={() => setViewMode("grid")} className={clsx("p-2 rounded-md transition-all", viewMode === "grid" ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode("list")} className={clsx("p-2 rounded-md transition-all", viewMode === "list" ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50")}><ListIcon className="w-4 h-4" /></button>
          </div>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-300 rounded-2xl">
            <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No projects found in this folder. Create one from the sidebar.</p>
          </div>
        ) : (
          <div className={clsx(viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "flex flex-col gap-2")}>
            {workspaces.map((ws) => (
              <div
                key={ws}
                onClick={() => onSelect(ws)}
                className={clsx(
                  "group relative flex items-center justify-between bg-white border border-slate-200 cursor-pointer transition-all hover:border-blue-200 hover:ring-1 hover:ring-blue-200",
                  viewMode === "grid" ? "p-6 rounded-2xl shadow-sm hover:shadow-md" : "px-4 py-3 rounded-xl hover:bg-blue-50/30"
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={clsx("bg-blue-50 text-blue-600 rounded-xl transition-colors group-hover:bg-blue-600 group-hover:text-white", viewMode === "grid" ? "p-3" : "p-2")}>
                    <Folder className={clsx(viewMode === "grid" ? "w-6 h-6" : "w-5 h-5")} />
                  </div>
                  <div>
                    <h3 className={clsx("font-semibold text-slate-800 group-hover:text-blue-700 transition-colors", viewMode === "grid" ? "text-base" : "text-sm")}>{ws}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className={clsx("text-slate-300 group-hover:text-blue-500 transition-all", viewMode === "grid" ? "w-5 h-5 group-hover:translate-x-1 group-hover:opacity-0" : "w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1")} />
                  <div className={clsx("transition-all", viewMode === "grid" ? "absolute top-6 right-6 opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100")} onClick={(e) => e.stopPropagation()}>
                    <ItemActionMenu itemName={ws} itemType="Project" onRename={(newName) => onRenameWorkspace(ws, newName)} onDelete={() => onDeleteWorkspace(ws)} triggerClassName="hover:bg-blue-100 text-slate-400 hover:text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
