"use client";

import { TaskItem } from "./task-types";
import { Draggable } from "@hello-pangea/dnd";
import { Calendar, MoreHorizontal } from "lucide-react";
import clsx from "clsx";

const AVATAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-indigo-500"];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

type TaskCardProps = {
  task: TaskItem;
  index: number;
  onClick?: () => void;
};

const priorityColors = {
  low: "bg-blue-100 text-blue-700",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={clsx(
            "bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer",
            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-500/20 rotate-1" : ""
          )}
        >
          <div className="flex items-start justify-between mb-2">
            <span
              className={clsx(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                priorityColors[task.priority]
              )}
            >
              {task.priority}
            </span>
            <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 rounded transition">
              <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <h4 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
              {task.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="flex items-center gap-3">
               {task.dueDate && (
                 <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>{task.dueDate}</span>
                 </div>
               )}
               {typeof task.progress === "number" && task.progress > 0 && (
                 <span className="text-[10px] text-slate-400 font-medium">{task.progress}%</span>
               )}
            </div>

            {task.assignees && task.assignees.length > 0 && (
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
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
