"use client";

import { Briefcase, Layers, Zap, Clock, AlertCircle, Flame, ListChecks } from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import clsx from "clsx";
import { QuickBoardTask } from "./task-types";
import { getIconByName } from "../../notes/utils/icon-utils";

type TasksQuickBoardProps = {
  tasks: QuickBoardTask[];
  loading: boolean;
  onTaskClick: (task: QuickBoardTask) => void;
};

type BucketId = "todo" | "in_progress" | "other";

const BUCKETS: { id: BucketId; label: string }[] = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "other", label: "Other" },
];

const priorityColors = {
  low: "bg-blue-500",
  medium: "bg-orange-500",
  high: "bg-red-500",
};

const priorityLabels = {
  low: "LOW",
  medium: "MED",
  high: "HIGH",
};

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500"];
const TAG_PALETTE = [
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = value.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash);
}

function colorForName(name: string): string {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

function colorForTag(tag: string) {
  return TAG_PALETTE[hashString(tag) % TAG_PALETTE.length];
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

// Custom columns vary per project ("Backlog", "Review", ...) — bucket them
// into the two states the user actually asked to see, plus a catch-all so
// nothing quietly disappears from the overview.
function bucketOf(columnTitle: string): BucketId {
  const t = columnTitle.toLowerCase();
  if (/in[\s-]?progress|doing|review/.test(t)) return "in_progress";
  if (/to[\s-]?do|todo|backlog|not started|open|new/.test(t)) return "todo";
  return "other";
}

function parseTaskDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr.replace(" ", "T"));
}

function StatTile({ icon: Icon, value, label, tone }: { icon: typeof Zap; value: number; label: string; tone: "slate" | "red" | "amber" }) {
  const toneClasses = {
    slate: "bg-white text-slate-600 border-slate-200",
    red: "bg-red-50 text-red-600 border-red-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  }[tone];
  return (
    <div className={clsx("flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm", toneClasses)}>
      <Icon className="w-4 h-4 opacity-70 shrink-0" />
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mt-1">{label}</p>
      </div>
    </div>
  );
}

function QuickTaskCard({ task, onClick }: { task: QuickBoardTask; onClick: () => void }) {
  const WorkspaceIcon = task.workspaceIconName ? getIconByName(task.workspaceIconName) : Layers;
  const ProjectIcon = task.projectIconName ? getIconByName(task.projectIconName) : Briefcase;
  const due = parseTaskDate(task.dueDate);
  const isOverdue = due ? isPast(due) && !isToday(due) : false;
  const isDueToday = due ? isToday(due) : false;
  const assignees = task.assignees ?? [];
  const tags = task.tags ?? [];

  return (
    <div
      onClick={onClick}
      className="group bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
    >
      <h4 className="text-sm font-semibold text-slate-800 mb-1 leading-snug">{task.title}</h4>

      {task.description ? (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
      ) : (
        <p className="text-xs text-slate-300 italic">No description.</p>
      )}

      {/* Detail — collapsed by default, revealed on hover so the board reads
          as a quick title/description scan until you linger on a card. */}
      <div className="grid transition-[grid-template-rows] duration-200 ease-out grid-rows-[0fr] group-hover:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <div className="pt-3 mt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
              <span
                className={clsx(
                  "shrink-0 flex items-center justify-center px-1.5 h-5 rounded-md text-[9px] font-black text-white tracking-wide",
                  priorityColors[task.priority]
                )}
              >
                {priorityLabels[task.priority]}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 truncate max-w-[140px]">
                {task.columnTitle}
              </span>
            </div>

            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                {tags.slice(0, 3).map((tag) => {
                  const c = colorForTag(tag);
                  return (
                    <span key={tag} className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full truncate max-w-[100px]", c.bg, c.text)}>
                      {tag}
                    </span>
                  );
                })}
                {tags.length > 3 && (
                  <span className="text-[10px] font-bold text-slate-400">+{tags.length - 3}</span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-bold">
                <WorkspaceIcon className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{task.workspaceName}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                <ProjectIcon className="w-3 h-3" />
                <span className="truncate max-w-[100px]">{task.projectName}</span>
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center -space-x-1.5">
                {assignees.length === 0 ? (
                  <span className="text-[10px] text-slate-300 italic">Unassigned</span>
                ) : (
                  <>
                    {assignees.slice(0, 3).map((a) => (
                      <div
                        key={a.id}
                        title={a.name}
                        className={clsx(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-white",
                          colorForName(a.name)
                        )}
                      >
                        {initialsForName(a.name)}
                      </div>
                    ))}
                    {assignees.length > 3 && (
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600 ring-2 ring-white">
                        +{assignees.length - 3}
                      </div>
                    )}
                  </>
                )}
              </div>

              {due && (
                <div
                  className={clsx(
                    "inline-flex items-center gap-1 text-[10px] font-bold",
                    isOverdue ? "text-red-600" : isDueToday ? "text-amber-600" : "text-slate-400"
                  )}
                >
                  {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {isOverdue ? "Overdue · " : isDueToday ? "Today · " : ""}
                  {format(due, "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksQuickBoard({ tasks, loading, onTaskClick }: TasksQuickBoardProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/30 animate-pulse">
        <div className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  const grouped: Record<BucketId, QuickBoardTask[]> = { todo: [], in_progress: [], other: [] };
  tasks.forEach((t) => grouped[bucketOf(t.columnTitle)].push(t));
  const visibleBuckets = BUCKETS.filter((b) => b.id !== "other" || grouped.other.length > 0);

  const overdueCount = tasks.filter((t) => {
    const due = parseTaskDate(t.dueDate);
    return due && isPast(due) && !isToday(due);
  }).length;
  const dueTodayCount = tasks.filter((t) => {
    const due = parseTaskDate(t.dueDate);
    return due && isToday(due);
  }).length;
  const highPriorityCount = tasks.filter((t) => t.priority === "high").length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 [scrollbar-gutter:stable]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-bold text-slate-900">Active Tasks</h2>
        </div>
        <p className="text-slate-500 text-sm mb-6">
          Every unfinished task across all your workspaces and projects, in one place.
        </p>

        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Zap className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm font-medium">Nothing outstanding — you&apos;re all caught up.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <StatTile icon={ListChecks} value={tasks.length} label="Active" tone="slate" />
              <StatTile icon={AlertCircle} value={overdueCount} label="Overdue" tone="red" />
              <StatTile icon={Clock} value={dueTodayCount} label="Due Today" tone="amber" />
              <StatTile icon={Flame} value={highPriorityCount} label="High Priority" tone="red" />
            </div>

            <div
              className={clsx(
                "grid grid-cols-1 gap-4",
                visibleBuckets.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2"
              )}
            >
              {visibleBuckets.map((bucket) => (
                <div key={bucket.id} className="flex flex-col gap-3 min-w-0">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{bucket.label}</h3>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded-full">
                      {grouped[bucket.id].length}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {grouped[bucket.id].length === 0 ? (
                      <div className="text-xs text-slate-300 italic px-1">No tasks.</div>
                    ) : (
                      grouped[bucket.id].map((task) => (
                        <QuickTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
