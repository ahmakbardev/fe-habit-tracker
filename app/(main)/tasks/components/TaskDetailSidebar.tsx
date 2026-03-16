"use client";

import { TaskItem, TaskStatus, KanbanColumn } from "./task-types";
import { 
  X, 
  Calendar, 
  Flag, 
  Tag, 
  AlignLeft, 
  CheckCircle2, 
  Clock,
  Trash2,
  ChevronRight,
  ArrowRightCircle,
  MoreHorizontal,
  Edit3,
  Eye,
  Check,
  Link2,
  Layers,
  ChevronDown,
  CalendarDays,
  FolderOpen,
  Layout
} from "lucide-react";
import clsx from "clsx";
import MiniCalendar from "../../dashboard/components/MiniCalendar";
import { 
  Popover,
  PopoverTrigger,
  PopoverContent 
} from "@/components/ui/popover";
import React, { useState, useEffect, useRef } from "react";
import { initialNotesData } from "../../notes/components/workspace-data";
import { NoteItem } from "../../notes/components/NotesClientWrapper";

type TaskDetailSidebarProps = {
  task: TaskItem | null;
  columns: KanbanColumn[];
  onClose: () => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
};

const priorityConfig = {
  low: { color: "text-blue-600", bg: "bg-blue-50", icon: Flag },
  medium: { color: "text-orange-600", bg: "bg-orange-50", icon: Flag },
  high: { color: "text-red-600", bg: "bg-red-50", icon: Flag },
};

// --- CUSTOM COMPONENTS ---

const CustomSelect = ({ 
  label, 
  value, 
  options, 
  onChange, 
  renderValue,
  placeholder = "Select..."
}: { 
  label: string, 
  value: string, 
  options: { id: string, label: string, color?: string }[], 
  onChange: (val: string) => void,
  renderValue?: (val: string) => React.ReactNode,
  placeholder?: string
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="flex items-center justify-between w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-left">
        <div className="flex-1 truncate">
          {value ? (renderValue ? renderValue(value) : <span className="text-xs font-bold text-slate-700">{options.find(o => o.id === value)?.label || value}</span>) : <span className="text-xs font-medium text-slate-400">{placeholder}</span>}
        </div>
        <ChevronDown size={14} className="text-slate-400 ml-2" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-1 shadow-2xl border-slate-100" align="end">
      <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">{label}</p>
      <div className="max-h-60 overflow-y-auto">
        {options.length === 0 && <p className="px-3 py-4 text-[10px] text-slate-400 italic text-center">No options available</p>}
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={clsx(
              "w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all mb-0.5",
              value === opt.id ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <span className="truncate pr-4">{opt.label}</span>
            {value === opt.id && <Check size={14} className="shrink-0" />}
          </button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

const CustomDateTimePicker = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: string, 
  onChange: (val: string) => void,
  label: string
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="relative group">
      <button 
        onClick={() => inputRef.current?.showPicker()}
        className="flex items-center gap-3 w-full px-3 py-2 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all text-left"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
          <CalendarDays size={16} />
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{label}</p>
          <p className="text-xs font-bold text-slate-700">{value || "Set date & time"}</p>
        </div>
      </button>
      <input 
        ref={inputRef}
        type="datetime-local" 
        className="absolute opacity-0 pointer-events-none"
        value={value ? value.replace(" ", "T") : ""}
        onChange={(e) => onChange(e.target.value.replace("T", " "))}
      />
    </div>
  );
};

// --- HELPERS ---

const getNoteById = (idOrLink: string): NoteItem | null => {
  if (!idOrLink) return null;
  for (const folder of Object.values(initialNotesData)) {
    for (const workspace of Object.values(folder)) {
      const note = workspace.find(n => n.id === idOrLink);
      if (note) return note;
    }
  }
  if (idOrLink.startsWith("notes://")) {
    const parts = idOrLink.replace("notes://", "").split("/");
    if (parts.length === 3) {
      const [fName, wName, nId] = parts.map(p => decodeURIComponent(p));
      const note = initialNotesData[fName]?.[wName]?.find(n => n.id === nId);
      if (note) return note;
    }
  }
  return null;
};

export default function TaskDetailSidebar({ 
  task, 
  columns,
  onClose, 
  onUpdateTask, 
  onDeleteTask 
}: TaskDetailSidebarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskItem | null>(null);
  const [showNotePreview, setShowNotePreview] = useState(false);
  const [linkMode, setLinkMode] = useState<"selector" | "direct">("selector");
  const [selFolder, setSelFolder] = useState<string>("");
  const [selWorkspace, setSelWorkspace] = useState<string>("");

  useEffect(() => {
    if (task) {
      setDraft(task);
      setShowNotePreview(false);
    }
  }, [task, isEditing]);

  if (!task) {
    return (
      <aside className="h-full w-[350px] bg-white border-l border-slate-200 z-20 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Schedule</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <MiniCalendar />
          <div className="mt-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Upcoming Tasks</h4>
            <div className="space-y-3">
              <p className="text-sm text-slate-500 italic">Select a task to see details.</p>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  const displayTask = isEditing && draft ? draft : task;

  const handleUpdate = (updates: Partial<TaskItem>) => {
    if (isEditing) {
      setDraft((prev: TaskItem | null) => prev ? { ...prev, ...updates } : null);
    } else {
      onUpdateTask({ ...task, ...updates });
    }
  };

  const handleSave = () => {
    if (draft) {
      onUpdateTask(draft);
      setIsEditing(false);
    }
  };

  const currentColumnIndex = columns.findIndex(col => col.id === displayTask.status);
  const nextColumn = currentColumnIndex !== -1 && currentColumnIndex < columns.length - 1 
    ? columns[currentColumnIndex + 1] 
    : null;

  const handleMoveToColumn = (columnId: string) => {
    handleUpdate({ status: columnId });
  };

  const priorityKey = displayTask.priority as keyof typeof priorityConfig;
  const PriorityIcon = priorityConfig[priorityKey].icon;

  // Selector Logic
  const folders = Object.keys(initialNotesData);
  const workspaces = selFolder ? Object.keys(initialNotesData[selFolder] || {}) : [];
  const notes = selFolder && selWorkspace ? initialNotesData[selFolder][selWorkspace] : [];

  return (
    <aside className="h-full w-[450px] bg-white border-l border-slate-200 z-30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 flex-shrink-0 relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          {isEditing ? (
             <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-left-2 duration-300">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Editing Mode</span>
                </div>
                <button onClick={() => setIsEditing(false)} className="text-[10px] font-bold text-slate-400 uppercase hover:text-red-500 transition px-2">Cancel</button>
             </div>
          ) : (
            <div className="flex bg-slate-200/50 p-1 rounded-lg">
               <button onClick={() => setIsEditing(false)} className={clsx("p-1.5 rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", !isEditing ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                  <Eye className="w-3.5 h-3.5" /> View
               </button>
               <button onClick={() => setIsEditing(true)} className={clsx("p-1.5 rounded-md transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider", isEditing ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                  <Edit3 className="w-3.5 h-3.5" /> Edit
               </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && <button onClick={() => onDeleteTask(task.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>}
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition"><X className="w-4 h-4 text-slate-500" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {/* Title */}
        <div className={clsx(isEditing && "p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed")}>
          {isEditing ? (
            <textarea className="w-full text-2xl font-bold text-slate-800 border-none focus:ring-0 resize-none p-0 bg-transparent placeholder:text-slate-300" placeholder="Task title" rows={2} value={displayTask.title} onChange={(e) => handleUpdate({ title: e.target.value })} />
          ) : (
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">{displayTask.title || "Untitled Task"}</h2>
          )}
        </div>

        {/* Status Progress */}
        {!isEditing && (
          <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm animate-in fade-in zoom-in duration-300">
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">Status Progress</p>
            <div className="flex items-center gap-3">
                {nextColumn ? (
                  <button onClick={() => handleMoveToColumn(nextColumn.id)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition active:scale-95">
                    Move to {nextColumn.title} <ArrowRightCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl text-sm font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Task Completed
                  </div>
                )}
                <Popover>
                  <PopoverTrigger asChild><button className="p-3 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition"><MoreHorizontal className="w-5 h-5" /></button></PopoverTrigger>
                  <PopoverContent className="w-48 p-1" side="bottom" align="end">
                    <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase">Jump to stage:</p>
                    {columns.map(col => (
                      <button key={col.id} disabled={col.id === displayTask.status} onClick={() => handleMoveToColumn(col.id)} className={clsx("w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-md transition", col.id === displayTask.status ? "bg-slate-50 text-slate-400 cursor-not-allowed" : "text-slate-600 hover:bg-blue-50 hover:text-blue-600")}><div className={clsx("w-1.5 h-1.5 rounded-full", col.id === displayTask.status ? "bg-slate-300" : "bg-blue-400")} />{col.title}</button>
                    ))}
                  </PopoverContent>
                </Popover>
            </div>
          </div>
        )}

        {/* Info Stack */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3 text-slate-400"><Tag className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Status</span></div>
            {isEditing ? (
              <div className="w-48">
                <CustomSelect 
                  label="Move to Status"
                  value={displayTask.status}
                  options={columns.map(c => ({ id: c.id, label: c.title }))}
                  onChange={(val) => handleUpdate({ status: val })}
                  renderValue={(v) => (
                    <span className="text-xs font-black text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-lg">
                      {columns.find(c => c.id === v)?.title}
                    </span>
                  )}
                />
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">{columns.find(c => c.id === displayTask.status)?.title || displayTask.status}</span>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center gap-3 text-slate-400"><Flag className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Priority</span></div>
            {isEditing ? (
              <div className="w-48">
                <CustomSelect 
                  label="Set Priority"
                  value={displayTask.priority}
                  options={[
                    { id: "low", label: "Low Priority" },
                    { id: "medium", label: "Medium Priority" },
                    { id: "high", label: "High Priority" }
                  ]}
                  onChange={(val) => handleUpdate({ priority: val as TaskItem["priority"] })}
                  renderValue={(v) => (
                    <div className={clsx(
                      "inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      priorityConfig[v as keyof typeof priorityConfig].bg,
                      priorityConfig[v as keyof typeof priorityConfig].color
                    )}>
                      <Flag size={10} />
                      {v}
                    </div>
                  )}
                />
              </div>
            ) : (
              <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold", priorityConfig[priorityKey].bg, priorityConfig[priorityKey].color)}><span className="capitalize">{displayTask.priority}</span></div>
            )}
          </div>

          {/* New Custom Date Pickers Stack */}
          {isEditing ? (
            <div className="grid grid-cols-1 gap-3 pt-2">
               <CustomDateTimePicker 
                 label="Start Time"
                 value={displayTask.startDate || ""}
                 onChange={(val) => handleUpdate({ startDate: val })}
               />
               <CustomDateTimePicker 
                 label="Deadline"
                 value={displayTask.dueDate || ""}
                 onChange={(val) => handleUpdate({ dueDate: val })}
               />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3 text-slate-400"><Calendar className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Start Time</span></div>
                <span className="text-xs font-bold text-slate-600">{displayTask.startDate || "—"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3 text-slate-400"><Clock className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider">Deadline</span></div>
                <span className="text-xs font-bold text-slate-600">{displayTask.dueDate || "—"}</span>
              </div>
            </>
          )}

          {/* RELATED NOTE Section */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-400"><AlignLeft className="w-4 h-4" /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Related Note</span></div>
              {isEditing && (
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                   <button onClick={() => setLinkMode("selector")} className={clsx("px-2 py-1 text-[9px] font-black uppercase rounded-md transition-all", linkMode === "selector" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>Select</button>
                   <button onClick={() => setLinkMode("direct")} className={clsx("px-2 py-1 text-[9px] font-black uppercase rounded-md transition-all", linkMode === "direct" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400")}>Link</button>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 border-dashed animate-in fade-in duration-300">
                {linkMode === "selector" ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 ml-1 text-slate-400">
                        <FolderOpen size={10} />
                        <p className="text-[9px] font-black uppercase tracking-widest">Folder</p>
                      </div>
                      <CustomSelect 
                        label="Choose Folder"
                        placeholder="Choose Folder..."
                        value={selFolder}
                        options={folders.map(f => ({ id: f, label: f }))}
                        onChange={(val) => { setSelFolder(val); setSelWorkspace(""); }}
                      />
                    </div>
                    {selFolder && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 ml-1 text-slate-400">
                          <Layout size={10} />
                          <p className="text-[9px] font-black uppercase tracking-widest">Workspace</p>
                        </div>
                        <CustomSelect 
                          label="Choose Workspace"
                          placeholder="Choose Workspace..."
                          value={selWorkspace}
                          options={workspaces.map(w => ({ id: w, label: w }))}
                          onChange={(val) => setSelWorkspace(val)}
                        />
                      </div>
                    )}
                    {selWorkspace && (
                      <div className="space-y-1.5 animate-in slide-in-from-top-1">
                        <div className="flex items-center gap-2 ml-1 text-slate-400">
                          <Layers size={10} />
                          <p className="text-[9px] font-black uppercase tracking-widest">Note</p>
                        </div>
                        <CustomSelect 
                          label="Select Note"
                          placeholder="Select a Note..."
                          value={displayTask.linkedNoteId || ""}
                          options={notes.map(n => ({ id: n.id, label: n.title }))}
                          onChange={(val) => handleUpdate({ linkedNoteId: val || undefined })}
                          renderValue={(v) => (
                            <span className="text-xs font-black text-blue-600 truncate block">
                              {notes.find(n => n.id === v)?.title || v}
                            </span>
                          )}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase ml-1">Direct Note URL</p>
                    <div className="relative">
                      <input className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm" placeholder="notes://Folder/Workspace/NoteID" value={displayTask.linkedNoteId || ""} onChange={(e) => handleUpdate({ linkedNoteId: e.target.value })} />
                      <Link2 size={14} className="absolute left-3 top-3 text-slate-400" />
                    </div>
                    <p className="text-[9px] text-slate-400 px-1 italic">Example: notes://Awsmd/Notes/1</p>
                  </div>
                )}
              </div>
            )}

            {!isEditing && displayTask.linkedNoteId && (
              <div onClick={() => setShowNotePreview(true)} className="group relative bg-slate-50/50 hover:bg-white border border-slate-100 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-5 h-5 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500"><Layers size={10} /></div>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Linked Resource</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{getNoteById(displayTask.linkedNoteId)?.title || "Unknown Resource"}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{getNoteById(displayTask.linkedNoteId)?.desc || "Click to view content."}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-all shadow-sm">
                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
            <AlignLeft className="w-4 h-4 text-slate-400" /><span className="text-sm font-bold uppercase tracking-wider text-slate-400">Description</span>
          </div>
          {isEditing ? (
            <textarea className="w-full min-h-[180px] text-sm text-slate-600 bg-slate-50 rounded-2xl p-5 border border-slate-200 focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 leading-relaxed outline-none transition-all" placeholder="Add a more detailed description..." value={displayTask.description} onChange={(e) => handleUpdate({ description: e.target.value })} />
          ) : (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-2xl border border-slate-100">{displayTask.description || "No description provided."}</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-slate-50 border-t border-slate-100">
        {isEditing ? (
          <div className="flex flex-col gap-3">
            <button onClick={handleSave} className="w-full py-4 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-100 active:scale-[0.98]"><Check className="w-5 h-5" /> Save Changes</button>
            <button onClick={() => setIsEditing(false)} className="w-full py-3 bg-white text-slate-500 text-xs font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition">Discard Changes</button>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
            <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span>Updated recently</span></div>
          </div>
        )}
      </div>

      {/* Preview Overlay */}
      {showNotePreview && displayTask.linkedNoteId && (
        <div className="absolute inset-0 bg-white z-50 animate-in slide-in-from-right duration-300 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100"><Layers className="w-3.5 h-3.5" /><span className="text-[10px] font-bold uppercase tracking-wider">Note Preview</span></div>
            </div>
            <button onClick={() => setShowNotePreview(false)} className="p-2 hover:bg-slate-200 rounded-lg transition"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{getNoteById(displayTask.linkedNoteId)?.title}</h2>
            <div className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: getNoteById(displayTask.linkedNoteId)?.desc || "" }} />
          </div>
          <div className="p-6 bg-slate-50 border-t border-slate-100">
             <button onClick={() => setShowNotePreview(false)} className="w-full py-3 bg-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition">Back to Task</button>
          </div>
        </div>
      )}
    </aside>
  );
}
