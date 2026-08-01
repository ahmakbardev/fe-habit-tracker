"use client";

import { TaskItem, KanbanColumn, TaskAttachment, TaskComment } from "./task-types";
import {
  X,
  Calendar,
  Flag,
  Clock,
  Trash2,
  MoreVertical,
  Pencil,
  Share2,
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
  Pin,
  PinOff,
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
import { NoteService } from "../../notes/services/note-service";
import CommentRichEditor, { commentContentClasses, isCommentEmpty, sanitizeCommentHtml } from "./CommentRichEditor";
import CustomSelect from "./ui/CustomSelect";
import CustomDateInput from "./ui/CustomDateInput";

type TaskDetailSidebarProps = {
  task: TaskItem | null;
  columns: KanbanColumn[];
  onClose: () => void;
  onDeleteTask: (id: string) => void;
  onUpdateTaskFields: (taskId: string, fields: Partial<{
    title: string; description: string | null; priority: "low" | "medium" | "high";
    column_id: string; start_date: string | null; due_date: string | null; progress: number;
  }>) => Promise<void>;
  onAddSubtask: (taskId: string, title: string) => Promise<void>;
  onToggleSubtask: (subtaskId: string, completed: boolean) => Promise<void>;
  onDeleteSubtask: (subtaskId: string) => Promise<void>;
  onAddComment: (taskId: string, data: { body?: string; image_url?: string; image_name?: string }) => Promise<void>;
  onTogglePinComment: (commentId: string, pinned: boolean) => Promise<void>;
  onAddAttachment: (taskId: string, data: { name: string; url: string; extension?: string; size?: number }) => Promise<void>;
  onDeleteAttachment: (attachmentId: string) => Promise<void>;
  onAddAssignee: (taskId: string, userId: number) => Promise<void>;
  onRemoveAssignee: (taskId: string, userId: number) => Promise<void>;
};

type TabId = "details" | "subtasks" | "comments" | "activities";

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


export default function TaskDetailSidebar({
  task,
  columns,
  onClose,
  onDeleteTask,
  onUpdateTaskFields,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onAddComment,
  onTogglePinComment,
  onAddAttachment,
  onDeleteAttachment,
  onAddAssignee,
  onRemoveAssignee,
}: TaskDetailSidebarProps) {
  const [me, setMe] = useState<ProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("details");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [pendingCommentImage, setPendingCommentImage] = useState<{ url: string; name: string; file: File } | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const [editingDescription, setEditingDescription] = useState(false);
  const [descDraft, setDescDraft] = useState("");
  const [progressDraft, setProgressDraft] = useState(0);
  const [shareCopied, setShareCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const commentImageInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ProfileService.get().then(setMe).catch(() => {});
  }, []);

  useEffect(() => {
    setActiveTab("details");
    setEditingTitle(false);
    setEditingDescription(false);
    setProgressDraft(task?.progress ?? 0);
  }, [task?.id, task?.progress]);

  // Jump to the top of the content area whenever the tab changes, so
  // switching tabs never leaves the user mid-scroll in the old section.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  if (!task) {
    return (
      <aside className="h-[calc(100%-24px)] my-3 mr-3 w-[350px] bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-20 flex flex-col flex-shrink-0 transition-all duration-300">
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
  const subtasks = task.subtasks || [];
  const attachments = task.attachments || [];
  const comments = task.comments || [];
  const activities = task.activities || [];
  const assignees = task.assignees || [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const pinnedComments = comments.filter((c) => c.pinned);
  const otherComments = comments.filter((c) => !c.pinned);

  // --- Title / Description ---
  const startEditTitle = () => {
    setTitleDraft(task.title);
    setEditingTitle(true);
  };
  const saveTitle = () => {
    setEditingTitle(false);
    if (titleDraft.trim() && titleDraft !== task.title) {
      onUpdateTaskFields(task.id, { title: titleDraft.trim() }).catch(console.error);
    }
  };

  const startEditDescription = () => {
    setDescDraft(task.description || "");
    setEditingDescription(true);
  };
  const saveDescription = () => {
    setEditingDescription(false);
    if (descDraft !== (task.description || "")) {
      onUpdateTaskFields(task.id, { description: descDraft || null }).catch(console.error);
    }
  };

  // --- Metadata handlers ---
  const handleStatusChange = (statusId: string) => {
    onUpdateTaskFields(task.id, { column_id: statusId }).catch(console.error);
  };

  const handlePriorityChange = (priority: string) => {
    onUpdateTaskFields(task.id, { priority: priority as TaskItem["priority"] }).catch(console.error);
  };

  const handleDueDateChange = (val: string) => {
    onUpdateTaskFields(task.id, { due_date: val || null }).catch(console.error);
  };

  const handleStartDateChange = (val: string) => {
    onUpdateTaskFields(task.id, { start_date: val || null }).catch(console.error);
  };

  const commitProgress = () => {
    if (progressDraft !== (task.progress ?? 0)) {
      onUpdateTaskFields(task.id, { progress: progressDraft }).catch(console.error);
    }
  };

  // --- Assignees ---
  const addMeAsAssignee = () => {
    if (!me) return;
    if (assignees.some((a) => Number(a.id) === me.id)) return;
    onAddAssignee(task.id, me.id).catch(console.error);
  };
  const removeAssignee = (id: string) => {
    onRemoveAssignee(task.id, Number(id)).catch(console.error);
  };

  // --- Attachments ---
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = "";
    for (const file of Array.from(files)) {
      try {
        const { url } = await NoteService.uploadMedia(file);
        if (!url) continue;
        await onAddAttachment(task.id, {
          name: file.name,
          url,
          extension: (file.name.split(".").pop() || "FILE").toUpperCase(),
          size: file.size,
        });
      } catch (e) {
        console.error("Failed to upload attachment:", e);
      }
    }
  };

  const removeAttachment = (id: string) => {
    onDeleteAttachment(id).catch(console.error);
  };

  const downloadAttachment = (attachment: TaskAttachment) => {
    if (!attachment.url) return;
    window.open(attachment.url, "_blank", "noopener,noreferrer");
  };

  const downloadAll = () => {
    attachments.filter((a) => a.url).forEach((a) => downloadAttachment(a));
  };

  // --- Subtasks ---
  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    onAddSubtask(task.id, newSubtaskTitle.trim()).catch(console.error);
    setNewSubtaskTitle("");
  };

  const toggleSubtask = (id: string) => {
    const target = subtasks.find((s) => s.id === id);
    if (!target) return;
    onToggleSubtask(id, !target.completed).catch(console.error);
  };

  const removeSubtask = (id: string) => {
    onDeleteSubtask(id).catch(console.error);
  };

  // --- Comments ---
  const handleCommentImageSelected = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (pendingCommentImage) URL.revokeObjectURL(pendingCommentImage.url);
    setPendingCommentImage({ url: URL.createObjectURL(file), name: file.name, file });
    if (commentImageInputRef.current) commentImageInputRef.current.value = "";
  };

  const clearPendingCommentImage = () => {
    if (pendingCommentImage) URL.revokeObjectURL(pendingCommentImage.url);
    setPendingCommentImage(null);
  };

  const postComment = async () => {
    if (isCommentEmpty(newCommentText) && !pendingCommentImage) return;
    setIsPostingComment(true);
    try {
      let imageUrl: string | undefined;
      let imageName: string | undefined;
      if (pendingCommentImage) {
        const uploaded = await NoteService.uploadMedia(pendingCommentImage.file);
        imageUrl = uploaded.url || undefined;
        imageName = pendingCommentImage.name;
      }
      await onAddComment(task.id, {
        body: isCommentEmpty(newCommentText) ? undefined : sanitizeCommentHtml(newCommentText),
        image_url: imageUrl,
        image_name: imageName,
      });
      setNewCommentText("");
      clearPendingCommentImage();
    } catch (e) {
      console.error("Failed to post comment:", e);
    } finally {
      setIsPostingComment(false);
    }
  };

  const togglePinComment = (id: string) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;
    onTogglePinComment(id, !target.pinned).catch(console.error);
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

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: "details", label: "Details" },
    { id: "subtasks", label: "Subtasks", count: subtasks.length },
    { id: "comments", label: "Comments", count: comments.length },
    { id: "activities", label: "Activities" },
  ];

  const renderComment = (c: TaskComment) => (
    <div key={c.id} className={clsx("group/comment flex items-start gap-3 rounded-xl p-2 -mx-2", c.pinned && "bg-amber-50/70")}>
      <Avatar name={c.author} avatarUrl={c.avatarUrl} size={28} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{c.author}</span>
          <span className="text-[10px] text-slate-400">{formatDateTime(c.createdAt, "MMM d, h:mm a")}</span>
          {c.pinned && (
            <span className="flex items-center gap-1 text-[9px] font-black text-amber-600 uppercase tracking-wider">
              <Pin size={9} className="fill-amber-500" /> Pinned
            </span>
          )}
        </div>
        {c.text && !isCommentEmpty(c.text) && (
          <div className={clsx(commentContentClasses, "mt-0.5")} dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(c.text) }} />
        )}
        {c.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.imageUrl}
            alt={c.imageName || "attached image"}
            className="mt-2 max-h-48 rounded-xl border border-slate-100 object-cover"
          />
        )}
      </div>
      <button
        onClick={() => togglePinComment(c.id)}
        title={c.pinned ? "Unpin comment" : "Pin comment"}
        className={clsx(
          "shrink-0 p-1.5 rounded-lg transition opacity-0 group-hover/comment:opacity-100",
          c.pinned ? "opacity-100 text-amber-600 hover:bg-amber-100" : "text-slate-300 hover:text-slate-500 hover:bg-slate-100"
        )}
      >
        {c.pinned ? <PinOff size={14} /> : <Pin size={14} />}
      </button>
    </div>
  );

  return (
    <aside className="h-[calc(100%-24px)] my-3 mr-3 w-[480px] bg-white border border-slate-200 rounded-2xl overflow-hidden z-30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 flex-shrink-0">
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

      {/* Title */}
      <div className="px-6 pt-5 pb-1">
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
      </div>

      {/* Tabs — sits right below the title so switching never needs a scroll first */}
      <div className="px-6 border-b border-slate-100 flex items-center gap-6 shrink-0">
        {TABS.map((tab) => (
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

      {/* Tab content — each tab replaces the whole body below the tab bar */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5">
        {activeTab === "details" && (
          <div>
            <div className="space-y-0">
              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center gap-3 text-slate-400">
                  <Flag className="w-4 h-4" />
                  <span className="text-xs font-medium">Priority</span>
                </div>
                <CustomSelect
                  variant="minimal"
                  align="end"
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
                  variant="minimal"
                  align="end"
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
                <CustomDateInput
                  mode="datetime"
                  variant="inline"
                  value={task.dueDate || ""}
                  onChange={handleDueDateChange}
                  placeholder="Set due date"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center gap-3 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">Start time</span>
                </div>
                <CustomDateInput
                  mode="datetime"
                  variant="inline"
                  value={task.startDate || ""}
                  onChange={handleStartDateChange}
                  placeholder="Set start time"
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b border-slate-50">
                <div className="flex items-center gap-3 text-slate-400 shrink-0">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Progress</span>
                </div>
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progressDraft}%` }} />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs font-bold text-slate-600 w-9 text-right hover:text-blue-600 transition">{progressDraft}%</button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-3" align="end">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Progress</p>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={progressDraft}
                        onChange={(e) => setProgressDraft(Number(e.target.value))}
                        onMouseUp={commitProgress}
                        onTouchEnd={commitProgress}
                        className="w-full accent-blue-600"
                      />
                      <p className="text-center text-xs font-bold text-slate-600 mt-1">{progressDraft}%</p>
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
                  {me && !assignees.some((a) => Number(a.id) === me.id) && (
                    <button
                      onClick={addMeAsAssignee}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <UserPlus size={12} /> Assign to me
                    </button>
                  )}
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
                {attachments.some((a) => a.url) && (
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
                        a.url ? "cursor-pointer hover:border-blue-300 hover:bg-blue-50/30" : "cursor-default"
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
        )}

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
                  <span className={clsx("flex-1 text-left text-sm font-medium py-0.5", s.completed ? "text-slate-400 line-through" : "text-slate-700")}>
                    {s.title}
                  </span>
                  <button onClick={() => removeSubtask(s.id)} className="text-slate-300 hover:text-red-500 transition shrink-0">
                    <X size={13} />
                  </button>
                </div>
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
          <div className="space-y-1">
            {comments.length === 0 && <p className="text-xs text-slate-400 italic">No comments yet.</p>}

            {pinnedComments.length > 0 && (
              <div className="mb-3 pb-3 border-b border-slate-100 space-y-1">
                {pinnedComments.map(renderComment)}
              </div>
            )}
            {otherComments.map(renderComment)}

            <div className="flex items-start gap-3 pt-4">
              <Avatar name={me?.name || "You"} avatarUrl={me ? resolveAvatarUrl(me.avatar_url) : null} size={28} />
              <div className="flex-1 space-y-2">
                {pendingCommentImage && (
                  <div className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pendingCommentImage.url} alt={pendingCommentImage.name} className="max-h-28 rounded-lg border border-slate-200" />
                    <button
                      onClick={clearPendingCommentImage}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-slate-700 text-white flex items-center justify-center"
                    >
                      <X size={9} />
                    </button>
                  </div>
                )}
                <CommentRichEditor value={newCommentText} onChange={setNewCommentText} />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => commentImageInputRef.current?.click()}
                    title="Attach image"
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <ImageIcon size={16} />
                  </button>
                  <input
                    ref={commentImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleCommentImageSelected(e.target.files)}
                  />
                  <button
                    onClick={postComment}
                    disabled={(isCommentEmpty(newCommentText) && !pendingCommentImage) || isPostingComment}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold disabled:opacity-30 hover:bg-blue-700 transition"
                  >
                    <MessageSquare size={12} /> {isPostingComment ? "Posting..." : "Post"}
                  </button>
                </div>
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
    </aside>
  );
}
