"use client";

import React, { useState } from "react";
import { ProjectData } from "./task-types";
import {
  User,
  Calendar,
  BarChart3
} from "lucide-react";
import clsx from "clsx";
import CustomSelect from "./ui/CustomSelect";
import CustomDateInput from "./ui/CustomDateInput";

type ProjectHeaderProps = {
  projectName: string;
  folderName: string;
  projectData: ProjectData;
  onUpdateProject: (updates: Partial<ProjectData>) => void;
};

const statusConfig = {
  planning: { label: "Planning", color: "text-amber-600 bg-amber-50 border-amber-100" },
  active: { label: "Active", color: "text-emerald-600 bg-green-50 border-green-100" },
  "on-hold": { label: "On Hold", color: "text-slate-500 bg-slate-50 border-slate-200" },
  completed: { label: "Completed", color: "text-blue-600 bg-blue-50 border-blue-100" },
};

export default function ProjectHeader({
  projectName,
  folderName,
  projectData,
  onUpdateProject
}: ProjectHeaderProps) {
  const [editingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [editingOwner, setEditingOwner] = useState(false);
  const [ownerDraft, setOwnerDraft] = useState("");

  const totalTasks = projectData.tasks.length;
  const doneColumnIds = new Set(
    projectData.columns
      .filter(c => c.title.toLowerCase().includes("done") || c.title.toLowerCase().includes("complete"))
      .map(c => c.id)
  );
  const completedTasks = projectData.tasks.filter(t => doneColumnIds.has(t.status)).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statusKey = (projectData.status || "planning") as keyof typeof statusConfig;

  // --- Description ---
  const startEditDescription = () => {
    setDescDraft(projectData.description || "");
    setEditingDescription(true);
  };
  const saveDescription = () => {
    setEditingDescription(false);
    if (descDraft !== (projectData.description || "")) {
      onUpdateProject({ description: descDraft });
    }
  };

  // --- Owner ---
  const startEditOwner = () => {
    setOwnerDraft(projectData.metadata?.owner || "");
    setEditingOwner(true);
  };
  const saveOwner = () => {
    setEditingOwner(false);
    if (ownerDraft !== (projectData.metadata?.owner || "")) {
      onUpdateProject({ metadata: { ...projectData.metadata, owner: ownerDraft } });
    }
  };

  return (
    <div className="px-8 py-3 bg-white border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500 shrink-0">
      <div className="max-w-6xl mx-auto flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">{folderName}</span>
          <span className="text-slate-300 text-[9px]">/</span>
        </div>

        <h1 className="text-lg font-black text-slate-900 tracking-tight shrink-0">{projectName}</h1>

        <CustomSelect
          variant="minimal"
          label="Project Status"
          value={statusKey}
          options={Object.entries(statusConfig).map(([id, cfg]) => ({ id, label: cfg.label }))}
          onChange={(val) => onUpdateProject({ status: val as ProjectData["status"] })}
          renderValue={() => (
            <span className={clsx("px-2 py-0.5 rounded-full text-[9px] font-black uppercase border", statusConfig[statusKey].color)}>
              {statusConfig[statusKey].label}
            </span>
          )}
        />

        {editingDescription ? (
          <textarea
            autoFocus
            className="flex-1 min-w-[200px] text-xs text-slate-600 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none leading-relaxed"
            placeholder="Add a description..."
            rows={1}
            value={descDraft}
            onChange={(e) => setDescDraft(e.target.value)}
            onBlur={saveDescription}
          />
        ) : (
          <p
            onClick={startEditDescription}
            className="flex-1 min-w-[120px] truncate text-xs text-slate-400 cursor-text hover:text-slate-500 transition-colors"
          >
            {projectData.description || "Add a description..."}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-400">
            <User size={13} />
            {editingOwner ? (
              <input
                autoFocus
                value={ownerDraft}
                onChange={(e) => setOwnerDraft(e.target.value)}
                onBlur={saveOwner}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                placeholder="Owner name"
                className="font-bold text-slate-700 bg-transparent border-b border-blue-300 outline-none w-24"
              />
            ) : (
              <span
                onClick={startEditOwner}
                className="font-bold text-slate-600 cursor-text hover:text-blue-600 transition-colors"
              >
                {projectData.metadata?.owner || "Unassigned"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar size={13} />
            <CustomDateInput
              mode="date"
              variant="inline"
              value={projectData.startDate || ""}
              onChange={(val) => onUpdateProject({ startDate: val })}
              placeholder="TBD"
            />
            <span className="text-slate-300">→</span>
            <CustomDateInput
              mode="date"
              variant="inline"
              value={projectData.endDate || ""}
              onChange={(val) => onUpdateProject({ endDate: val })}
              placeholder="TBD"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <BarChart3 size={13} />
            <div className="w-14 h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-black text-blue-600">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
