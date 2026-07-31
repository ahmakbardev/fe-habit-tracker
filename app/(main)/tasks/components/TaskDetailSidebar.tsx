"use client";

import { TaskItem, KanbanColumn, Subtask, TaskAttachment, TaskComment } from "./task-types";
import {
  X,
  Calendar,
  Flag,
  Clock,
  Trash2,
  MoreVertical,
  Pencil,
  Share2,
  Check,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Users,
  UserPlus,
  Paperclip,
  Download,
  Plus,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Archive,
  File as FileIcon,
  MessageSquare,
  History,
  Square,
  CheckSquare,
} from "lucide-react";
import clsx from "clsx";
import { format, isValid } from "date-fns";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import React, { useState, useEffect, useRef } from "react";
import { ProfileService, ProfileData, resolveAvatarUrl } from "@/lib/profile-service";

type TaskDetailSidebarProps = {
  task: TaskItem | null;
  columns: KanbanColumn[];
  onClose: () => void;
  onUpdateTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
};

const priorityConfig = {
  low: { color: "text-blue-700", bg: "bg-blue-100" },
  medium: { color: "text-orange-700", bg: "bg-orange-100" },
  high: { color: "text-red-700", bg: "bg-red-100" },
};

const STATUS_PALETTE = [
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500"];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function colorForStatus(id: string) {
  return STATUS_PALETTE[hashString(id) % STATUS_PALETTE.length];
}

function colorForName(name: string) {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function formatDateTime(value?: string, pattern = "MMM d, yyyy"): string {
  if (!value) return "—";
  const iso = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(iso);
  if (!isValid(date)) return "—";
  return format(date, pattern);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function iconForExtension(ext: string) {
  const e = ext.toLowerCase();
  if (e === "pdf") return { Icon: FileText, color: "text-red-500", bg: "bg-red-50" };
  if (["doc", "docx"].includes(e)) return { Icon: FileText, color: "text-blue-500", bg: "bg-blue-50" };
  if (["xls", "xlsx", "csv"].includes(e)) return { Icon: FileSpreadsheet, color: "text-emerald-500", bg: "bg-emerald-50" };
  if (["png", "jpg", "jpeg", "gif", "svg", "webp"].includes(e)) return { Icon: ImageIcon, color: "text-purple-500", bg: "bg-purple-50" };
  if (["zip", "rar", "7z"].includes(e)) return { Icon: Archive, color: "text-amber-500", bg: "bg-amber-50" };
  return { Icon: FileIcon, color: "text-slate-500", bg: "bg-slate-50" };
}

function Avatar({ name, avatarUrl, size = 26 }: { name: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
     
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover border-2 border-white shadow-sm"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={clsx("rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-sm shrink-0", colorForName(name))}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsForName(name)}
    </div>
  );
}

// --- CUSTOM COMPONENTS ---

const CustomSelect = ({
  label,
  value,
  options,
  onChange,
  renderValue,
  placeholder = "Select...",
}: {
  label: string;
  value: string;
  options: { id: string; label: string }[];
  onChange: (val: string) => void;
  renderValue?: (val: string) => React.ReactNode;
  placeholder?: string;
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
        {value ? (renderValue ? renderValue(value) : <span className="text-xs font-bold text-slate-700">{options.find((o) => o.id === value)?.label || value}</span>) : (
          <span className="text-xs font-medium text-slate-400">{placeholder}</span>
        )}
        <ChevronDown size={12} className="text-slate-300" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-56 p-1 shadow-2xl border-slate-100" align="end">
      <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">{label}</p>
      <div className="max-h-60 overflow-y-auto">
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

export default function TaskDetailSidebar({
  task,
  columns,
  onClose,
  onUpdateTask,
  onDeleteTask,
}: TaskDetailSidebarProps) {
  const [me, setMe] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"subtasks" | "comments" | "activities">("subtasks");
  const [expandedSubtaskId, setExpandedSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ProfileService.get().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    setActiveTab("subtasks");
    setExpandedSubtaskId(null);
    setEditingTitle(false);
    setEditingDescription(false);
  }, [task?.id]);

  if (!task) {
    return (
      <aside className="h-full w-[350px] bg-white border-l border-slate-200 z-20 flex flex-col flex-shrink-0 transition-all duration-300">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Task Details</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-md transition">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
          <p className="text-sm text-slate-400 italic">Select a task to see details.</p>
        </div>
      </aside>
    );
  }

  const priorityKey = task.priority as keyof typeof priorityConfig;
  const statusColor = colorForStatus(task.status);
  const currentColumnTitle = columns.find((c) => c.id === task.status)?.title || task.status;
  const progress = task.progress ?? 0;
  const subtasks = task.subtasks || [];
  const attachments = task.attachments || [];
  const comments = task.comments || [];
  const activities = task.activities || [];
  const assignees = task.assignees || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const logActivity = (message: string, updates: Partial<TaskItem> = {}) => {
    const entry = {
      id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      message,
      createdAt: new Date().toISOString(),
    };
    onUpdateTask({ ...task, ...updates, activities: [entry, ...activities] });
  };

  const commitUpdate = (updates: Partial<TaskItem>) => {
    onUpdateTask({ ...task, ...updates });
  };

  // --- Title / Description ---
  const startEditTitle = () => {
    setTitleDraft(task.title);
    setEditingTitle(true);
  };
  const saveTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== task.title) {
      logActivity("Title updated", { title: titleDraft.trim() });
    }
  };

  const startEditDescription = () => {
    setDescDraft(task.description || "");
    setEditingDescription(true);
  };
  const saveDescription = () => {
    setEditingDescription(false);
    if (descDraft !== (task.description || "")) {
      logActivity("Description updated", { description: descDraft });
    }
  };

  // --- Metadata handlers ---
  const handleStatusChange = (statusId: string) => {
    const title = columns.find((c) => c.id === statusId)?.title || statusId;
    logActivity(`Status changed to ${title}`, { status: statusId });
  };

  const handlePriorityChange = (priority: string) => {
    logActivity(`Priority set to ${priority}`, { priority: priority as TaskItem["priority"] });
  };

  const handleDueDateChange = (val: string) => {
    logActivity(`Due date set to ${formatDateTime(val)}`, { dueDate: val });
  };

  const handleStartDateChange = (val: string) => {
    commitUpdate({ startDate: val });
  };

  const handleProgressChange = (val: number) => {
    logActivity(`Progress updated to ${val}%`, { progress: val });
  };

  // --- Assignees ---
  const addAssignee = (name: string) => {
    if (!name.trim()) return;
    const newAssignee = { id: `assignee-${Date.now()}`, name: name.trim() };
    logActivity(`${newAssignee.name} added as assignee`, { assignees: [...assignees, newAssignee] });
    setInviteName("");
  };
  const addMeAsAssignee = () => {
    if (!me) return;
    if (assignees.some((a) => a.name === me.name)) return;
    const newAssignee = { id: `assignee-${Date.now()}`, name: me.name, avatarUrl: resolveAvatarUrl(me.avatar_url) };
    logActivity(`${me.name} added as assignee`, { assignees: [...assignees, newAssignee] });
  };
  const removeAssignee = (id: string) => {
    const target = assignees.find((a) => a.id === id);
    if (!target) return;
    logActivity(`${target.name} removed from assignees`, { assignees: assignees.filter((a) => a.id !== id) });
  };

  // --- Attachments ---
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newAttachments: TaskAttachment[] = Array.from(files).map((file) => ({
      id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      extension: (file.name.split(".").pop() || "FILE").toUpperCase(),
      size: formatFileSize(file.size),
      blobUrl: URL.createObjectURL(file),
    }));
    const names = newAttachments.map((a) => `"${a.name}"`).join(", ");
    logActivity(`Attachment ${names} added`, { attachments: [...attachments, ...newAttachments] });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (id: string) => {
    const target = attachments.find((a) => a.id === id);
    if (!target) return;
    if (target.blobUrl) URL.revokeObjectURL(target.blobUrl);
    logActivity(`Attachment "${target.name}" removed`, { attachments: attachments.filter((a) => a.id !== id) });
  };

  const downloadAttachment = (attachment: TaskAttachment) => {
    if (!attachment.blobUrl) return;
    const a = document.createElement("a");
    a.href = attachment.blobUrl;
    a.download = attachment.name;
    a.click();
  };

  const downloadAll = () => {
    attachments.filter((a) => a.blobUrl).forEach((a) => downloadAttachment(a));
  };

  // --- Subtasks ---
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const subtask: Subtask = { id: `subtask-${Date.now()}`, title: newSubtaskTitle.trim(), completed: false };
    logActivity(`Subtask "${subtask.title}" added`, { subtasks: [...subtasks, subtask] });
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (id: string) => {
    const updated = subtasks.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s));
    const target = updated.find((s) => s.id === id)!;
    logActivity(`Subtask "${target.title}" marked ${target.completed ? "complete" : "incomplete"}`, { subtasks: updated });
  };

  const removeSubtask = (id: string) => {
    const target = subtasks.find((s) => s.id === id);
    if (!target) return;
    logActivity(`Subtask "${target.title}" removed`, { subtasks: subtasks.filter((s) => s.id !== id) });
  };

  // --- Comments ---
  const postComment = () => {
    if (!newCommentText.trim()) return;
    const comment: TaskComment = {
      id: `comment-${Date.now()}`,
      author: me?.name || "You",
      avatarUrl: me ? resolveAvatarUrl(me.avatar_url) : null,
      text: newCommentText.trim(),
      createdAt: new Date().toISOString(),
    };
    logActivity("Comment added", { comments: [...comments, comment] });
    setNewCommentText("");
  };

  // --- Share ---
  const handleShare = async () => {
    const summary = `${task.title}\nStatus: ${currentColumnTitle}\nDue: ${formatDateTime(task.dueDate)}`;
    try {
      await navigator.clipboard.writeText(summary);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      // clipboard unavailable, silently ignore
    }
  };

  return (
    <aside className="h-full w-[480px] bg-white border-l border-slate-200 z-30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 flex-shrink-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-100 rounded-lg transition">
          <X className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-1">
          <button onClick={startEditTitle} title="Edit title" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={handleShare} title="Copy summary" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500 relative">
            <Share2 className="w-4 h-4" />
            {shareCopied && (
              <span className="absolute -bottom-7 right-0 text-[10px] font-bold bg-slate-800 text-white px-2 py-1 rounded-md whitespace-nowrap">Copied!</span>
            )}
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button title="More" className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-500">
                <MoreVertical className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-44 p-1" align="end">
              <button
                onClick={() => onDeleteTask(task.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Task
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pt-6">
          {/* Title */}
          {editingTitle ? (
            <textarea
              autoFocus
              className="w-full text-2xl font-bold text-slate-800 border-none focus:ring-0 resize-none p-0 bg-transparent"
              rows={2}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveTitle();
                }
              }}
            />
          ) : (
            <h2 onClick={startEditTitle} className="text-2xl font-bold text-slate-800 leading-tight cursor-text hover:text-slate-600 transition-colors">
              {task.title || "Untitled Task"}
            </h2>
          )}

          {/* Metadata rows */}
          <div className="mt-6 space-y-0">
            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <Flag className="w-4 h-4" />
                <span className="text-xs font-medium">Priority</span>
              </div>
              <CustomSelect
                label="Set Priority"
                value={task.priority}
                options={[
                  { id: "low", label: "Low" },
                  { id: "medium", label: "Medium" },
                  { id: "high", label: "High" },
                ]}
                onChange={handlePriorityChange}
                renderValue={() => (
                  <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider", priorityConfig[priorityKey].bg, priorityConfig[priorityKey].color)}>
                    {task.priority}
                  </span>
                )}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-4 h-4 flex items-center justify-center">✱</div>
                <span className="text-xs font-medium">Status</span>
              </div>
              <CustomSelect
                label="Move to Status"
                value={task.status}
                options={columns.map((c) => ({ id: c.id, label: c.title }))}
                onChange={handleStatusChange}
                renderValue={() => (
                  <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold", statusColor.bg, statusColor.text)}>
                    {currentColumnTitle}
                  </span>
                )}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Created date</span>
              </div>
              <span className="text-xs font-bold text-slate-600">{formatDateTime(task.createdAt, "MMM d, yyyy h:mm a")}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Due date</span>
              </div>
              <input
                type="datetime-local"
                className="text-xs font-bold text-slate-600 text-right outline-none cursor-pointer bg-transparent"
                value={task.dueDate ? task.dueDate.replace(" ", "T") : ""}
                onChange={(e) => handleDueDateChange(e.target.value.replace("T", " "))}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Start time</span>
              </div>
              <input
                type="datetime-local"
                className="text-xs font-bold text-slate-600 text-right outline-none cursor-pointer bg-transparent"
                value={task.startDate ? task.startDate.replace(" ", "T") : ""}
                onChange={(e) => handleStartDateChange(e.target.value.replace("T", " "))}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-50">
              <div className="flex items-center gap-3 text-slate-400 shrink-0">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Progress</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="text-xs font-bold text-slate-600 w-9 text-right hover:text-blue-600 transition">{progress}%</button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3" align="end">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress</p>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={progress}
                      onChange={(e) => handleProgressChange(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <p className="text-center text-xs font-bold text-slate-600 mt-1">{progress}%</p>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium">Assignees</span>
              </div>
              <div className="flex items-center gap-2">
                {assignees.slice(0, 2).map((a) => (
                  <div key={a.id} className="group/av relative">
                    <Avatar name={a.name} avatarUrl={a.avatarUrl} />
                    <button
                      onClick={() => removeAssignee(a.id)}
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover/av:opacity-100 transition"
                    >
                      <X size={9} />
                    </button>
                  </div>
                ))}
                {assignees.length > 2 && (
                  <div className="w-[26px] h-[26px] rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-600 font-bold">
                    +{assignees.length - 2}
                  </div>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition">
                      <UserPlus size={12} /> Invite
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="end">
                    {me && !assignees.some((a) => a.name === me.name) && (
                      <button
                        onClick={addMeAsAssignee}
                        className="w-full flex items-center gap-2 px-2 py-2 mb-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        <Avatar name={me.name} avatarUrl={resolveAvatarUrl(me.avatar_url)} size={18} /> Assign to me
                      </button>
                    )}
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Add by name</p>
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addAssignee(inviteName)}
                        placeholder="Name..."
                        className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/10"
                      />
                      <button onClick={() => addAssignee(inviteName)} className="px-2.5 bg-black text-white rounded-lg text-xs font-bold">
                        Add
                      </button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            {editingDescription ? (
              <textarea
                autoFocus
                className="w-full min-h-[100px] text-sm text-slate-600 bg-slate-50 rounded-2xl p-4 border border-slate-200 focus:ring-2 focus:ring-blue-500/10 outline-none leading-relaxed resize-none"
                placeholder="Add a more detailed description..."
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={saveDescription}
              />
            ) : (
              <p
                onClick={startEditDescription}
                className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl cursor-text hover:bg-slate-100/70 transition-colors"
              >
                {task.description || "Add a more detailed description..."}
              </p>
            )}
          </div>

          {/* Attachments */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-700">
                <Paperclip className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold">Attachments</span>
              </div>
              {attachments.some((a) => a.blobUrl) && (
                <button onClick={downloadAll} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                  <Download size={12} /> Download All
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {attachments.map((a) => {
                const { Icon, color, bg } = iconForExtension(a.extension);
                return (
                  <div
                    key={a.id}
                    onClick={() => downloadAttachment(a)}
                    className={clsx(
                      "group/att relative flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2.5 w-[180px]",
                      a.blobUrl ? "cursor-pointer hover:border-blue-300 hover:bg-blue-50/30" : "cursor-default"
                    )}
                  >
                    <div className={clsx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bg, color)}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">{a.name}</p>
                      <p className="text-[10px] text-slate-400">{a.extension} • {a.size}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeAttachment(a.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center opacity-0 group-hover/att:opacity-100 transition"
                    >
                      <X size={9} />
                    </button>
                  </div>
                );
              })}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center w-[52px] h-[52px] border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl transition text-slate-400 hover:text-blue-500"
              >
                <Plus size={18} />
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFilesSelected(e.target.files)} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 sticky top-0 bg-white">
          <div className="flex items-center gap-6 px-6 border-b border-slate-100">
            {(
              [
                { id: "subtasks" as const, label: "Subtasks", count: subtasks.length },
                { id: "comments" as const, label: "Comments", count: comments.length },
                { id: "activities" as const, label: "Activities", count: undefined },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  "flex items-center gap-1.5 py-3 text-sm font-bold border-b-2 transition-colors",
                  activeTab === tab.id ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
                )}
              >
                {tab.label}
                {tab.count !== undefined && <span className="text-[10px]">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="px-6 py-5">
          {activeTab === "subtasks" && (
            <div className="space-y-2">
              {subtasks.length > 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{completedSubtasks}/{subtasks.length} completed</p>
              )}
              {subtasks.map((s) => (
                <div key={s.id} className="rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-2.5 px-2 py-2">
                    <button onClick={() => toggleSubtask(s.id)} className="mt-0.5 shrink-0 text-slate-400 hover:text-blue-600 transition">
                      {s.completed ? <CheckSquare className="w-[18px] h-[18px] text-blue-600" /> : <Square className="w-[18px] h-[18px]" />}
                    </button>
                    <button
                      onClick={() => setExpandedSubtaskId(expandedSubtaskId === s.id ? null : s.id)}
                      className={clsx("flex-1 text-left text-sm font-medium", s.completed ? "text-slate-400 line-through" : "text-slate-700")}
                    >
                      {s.title}
                    </button>
                    {s.description && (
                      <ChevronRight className={clsx("w-3.5 h-3.5 text-slate-300 mt-1 transition-transform shrink-0", expandedSubtaskId === s.id && "rotate-90")} />
                    )}
                    <button onClick={() => removeSubtask(s.id)} className="text-slate-300 hover:text-red-500 transition shrink-0">
                      <X size={13} />
                    </button>
                  </div>
                  {expandedSubtaskId === s.id && s.description && (
                    <div className="ml-9 mb-3 mr-2 bg-slate-50 rounded-xl p-3 space-y-2 animate-in fade-in duration-200">
                      <p className="text-xs text-slate-500 leading-relaxed">{s.description}</p>
                      <div className="flex items-center justify-between">
                        {s.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={s.assignee} size={18} />
                            <span className="text-[10px] font-bold text-slate-600">{s.assignee}</span>
                          </div>
                        ) : <span />}
                        {s.dueDate && <span className="text-[10px] text-slate-400 font-medium">{formatDateTime(s.dueDate)}</span>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex items-center gap-2 pt-2">
                <input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSubtask()}
                  placeholder="Add a subtask..."
                  className="flex-1 text-sm px-3 py-2 bg-slate-50 border border-transparent focus:border-slate-200 rounded-lg outline-none transition"
                />
                <button onClick={addSubtask} disabled={!newSubtaskTitle.trim()} className="p-2 bg-slate-800 text-white rounded-lg disabled:opacity-30 transition">
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="space-y-4">
              {comments.length === 0 && <p className="text-xs text-slate-400 italic">No comments yet.</p>}
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-3">
                  <Avatar name={c.author} avatarUrl={c.avatarUrl} size={28} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">{c.author}</span>
                      <span className="text-[10px] text-slate-400">{formatDateTime(c.createdAt, "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3 pt-2">
                <Avatar name={me?.name || "You"} avatarUrl={me ? resolveAvatarUrl(me.avatar_url) : null} size={28} />
                <div className="flex-1 space-y-2">
                  <textarea
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    rows={2}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl outline-none resize-none transition"
                  />
                  <button
                    onClick={postComment}
                    disabled={!newCommentText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-blue-700 transition"
                  >
                    <MessageSquare size={12} /> Post
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activities" && (
            <div className="space-y-4">
              {activities.length === 0 && <p className="text-xs text-slate-400 italic">No activity yet.</p>}
              {activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <History size={13} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">{a.message}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(a.createdAt, "MMM d, yyyy h:mm a")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-6" />
      </div>
    </aside>
  );
}
