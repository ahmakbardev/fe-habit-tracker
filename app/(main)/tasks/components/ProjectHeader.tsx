"use client";

import React, { useState } from "react";
import { ProjectData } from "./task-types";
import { 
  Info, 
  User, 
  Target, 
  Flag,
  Edit2,
  Check,
  X,
  Calendar,
  Activity,
  BarChart3
} from "lucide-react";
import clsx from "clsx";
import { format } from "date-fns";

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
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(projectData.description || "");
  const [owner, setOwner] = useState(projectData.metadata?.owner || "");
  const [status, setStatus] = useState(projectData.status || "planning");
  const [startDate, setStartDate] = useState(projectData.startDate || "");
  const [endDate, setEndDate] = useState(projectData.endDate || "");

  const totalTasks = projectData.tasks.length;
  const completedTasks = projectData.tasks.filter(t => 
    t.status.toLowerCase().includes("done") || t.status.toLowerCase().includes("complete")
  ).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleSave = () => {
    onUpdateProject({
      description,
      status: status as ProjectData["status"],
      startDate,
      endDate,
      metadata: {
        ...projectData.metadata,
        owner
      }
    });
    setIsEditing(false);
  };

  const priorityColor = projectData.metadata?.priority === "high" ? "text-red-500 bg-red-50" :
                       projectData.metadata?.priority === "medium" ? "text-orange-500 bg-orange-50" :
                       "text-blue-500 bg-blue-50";

  return (
    <div className="px-8 py-8 bg-white border-b border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{folderName}</span>
                  <span className="text-slate-300 text-[10px]">/</span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">{projectName}</span>
                </div>
                {!isEditing && projectData.status && (
                  <div className={clsx(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase border",
                    statusConfig[projectData.status].color
                  )}>
                    {statusConfig[projectData.status].label}
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{projectName}</h1>
            </div>

            {isEditing ? (
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Project Status</label>
                      <select 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as NonNullable<ProjectData["status"]>)}
                      >
                        {Object.entries(statusConfig).map(([id, cfg]) => (
                          <option key={id} value={id}>{cfg.label}</option>
                        ))}
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Owner</label>
                      <input 
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        placeholder="Owner name"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                      <input 
                        type="date"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</label>
                      <input 
                        type="date"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                  <textarea
                    className="w-full text-sm text-slate-600 bg-white rounded-xl p-4 border border-slate-200 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all resize-none leading-relaxed"
                    placeholder="Add a project description..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-500 leading-relaxed max-w-3xl">
                  {projectData.description || "No description provided for this project. Add one to help your team understand the goals."}
                </p>

                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Owner</p>
                      <p className="text-xs font-black text-slate-700">{projectData.metadata?.owner || "Unassigned"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Timeline</p>
                      <p className="text-xs font-black text-slate-700">
                        {projectData.startDate ? format(new Date(projectData.startDate), "MMM d, yyyy") : "TBD"}
                        <span className="mx-1.5 text-slate-300">→</span>
                        {projectData.endDate ? format(new Date(projectData.endDate), "MMM d, yyyy") : "TBD"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <BarChart3 size={18} />
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.1em]">Progress</p>
                        <span className="text-[10px] font-black text-blue-600">{progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 pt-2">
            {isEditing ? (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleSave}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xl shadow-blue-100 hover:bg-blue-700 transition active:scale-95"
                >
                  <Check size={14} /> Update Project
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 transition"
                >
                  Discard
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition active:scale-95"
              >
                <Edit2 size={14} /> Settings
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
