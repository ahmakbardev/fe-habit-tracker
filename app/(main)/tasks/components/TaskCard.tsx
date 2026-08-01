"use client";

import { TaskItem } from "./task-types";
import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal } from "lucide-react";
import clsx from "clsx";

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500"];
const TAG_PALETTE = [
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-cyan-100", text: "text-cyan-700" },
];
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "gif", "webp", "svg"];

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

function ProgressRing({ progress, size = 20, strokeWidth = 2.5 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

type TaskCardProps = {
  task: TaskItem;
  index: number;
  onClick?: () => void;
};

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

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const category = task.tags?.[0];
  const categoryColor = category ? colorForTag(category) : null;
  const thumbnail = task.attachments?.find(
    (a) => a.url && IMAGE_EXTENSIONS.includes(a.extension.toLowerCase())
  );

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={clsx(
            "relative bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer",
            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-1" : ""
          )}
        >
          <button
            onClick={(e) => e.stopPropagation()}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition"
          >
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </button>

          <div className="flex items-center gap-2 mb-2.5 pr-5">
            <span
              className={clsx(
                "shrink-0 flex items-center justify-center px-1.5 h-5 rounded-md text-[9px] font-black text-white tracking-wide",
                priorityColors[task.priority]
              )}
            >
              {priorityLabels[task.priority]}
            </span>
            {category && categoryColor && (
              <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-full truncate", categoryColor.bg, categoryColor.text)}>
                {category}
              </span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-1 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          {thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail.url}
              alt={thumbnail.name}
              className="w-full h-24 object-cover rounded-xl border border-slate-100 mb-3"
            />
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            {task.assignees && task.assignees.length > 0 ? (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 2).map((a) => (
                  a.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={a.id} src={a.avatarUrl} alt={a.name} className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                  ) : (
                    <div key={a.id} className={clsx("w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold", colorForName(a.name))}>
                      {initialsForName(a.name)}
                    </div>
                  )
                ))}
                {task.assignees.length > 2 && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-500 font-bold">
                    +{task.assignees.length - 2}
                  </div>
                )}
              </div>
            ) : <span />}

            <div className="flex items-center gap-1.5">
              <ProgressRing progress={task.progress ?? 0} />
              <span className="text-[11px] text-slate-400 font-semibold">{task.progress ?? 0}%</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
