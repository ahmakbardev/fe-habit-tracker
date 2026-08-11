"use client";

import { useState, type CSSProperties } from "react";
import { TaskItem } from "./task-types";
import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import FolderIcon from "@/components/icons/FolderIcon";
import FileTypeIcon from "@/components/icons/FileTypeIcon";

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

function fileTypeVariant(extension: string): "pdf" | "xlsx" | "doc" {
  const ext = extension.toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xlsx";
  return "doc";
}

// Peeking-file "slots" inside the folder icon — position/rotation are fixed
// per slot, but width is derived from whichever FileTypeIcon variant ends up
// there (aspect ratio differs: xlsx is square, pdf/doc are a taller page
// shape) rather than hardcoded, since which attachment lands in which slot
// depends on array order, not file type. A fixed width sized for one shape
// would otherwise squash/shrink a different-shaped icon landing in that slot.
type FileIconSlot = {
  centerX: number;
  y: number;
  targetHeight: number;
  rotate: number;
  delay: number;
  // Extra offset applied on top of the resting position while the
  // thumbnail box is hovered, so files fan out a bit further apart instead
  // of just sitting still.
  hoverSpreadX: number;
  hoverSpreadY: number;
};

const FILE_ICON_ASPECT: Record<"pdf" | "xlsx" | "doc", number> = { pdf: 0.8, doc: 0.8, xlsx: 1 };

const FILE_ICON_SLOT_LEFT: FileIconSlot = { centerX: 51.5, y: -6, targetHeight: 106, rotate: -9, delay: 680, hoverSpreadX: -10, hoverSpreadY: 4 };
const FILE_ICON_SLOT_CENTER: FileIconSlot = { centerX: 113, y: -18, targetHeight: 118, rotate: 0, delay: 550, hoverSpreadX: 0, hoverSpreadY: -8 };
const FILE_ICON_SLOT_RIGHT: FileIconSlot = { centerX: 168, y: 7, targetHeight: 72, rotate: 20, delay: 810, hoverSpreadX: 10, hoverSpreadY: -4 };

// Dedicated (closer-together) pair used only for the 2-attachment case —
// same rotation angles as the left/right slots above, just squeezed nearer
// the folder's center instead of spread apart, with closer-matched heights
// so neither icon reads as oddly small next to the other.
const FILE_ICON_SLOT_PAIR_LEFT: FileIconSlot = { centerX: 79.5, y: -6, targetHeight: 106, rotate: -9, delay: 680, hoverSpreadX: -9, hoverSpreadY: 4 };
const FILE_ICON_SLOT_PAIR_RIGHT: FileIconSlot = { centerX: 128, y: 3, targetHeight: 90, rotate: 20, delay: 810, hoverSpreadX: 9, hoverSpreadY: -3 };

const FILE_ICON_SLOTS_BY_COUNT: Record<number, FileIconSlot[]> = {
  1: [FILE_ICON_SLOT_CENTER],
  2: [FILE_ICON_SLOT_PAIR_LEFT, FILE_ICON_SLOT_PAIR_RIGHT],
  3: [FILE_ICON_SLOT_LEFT, FILE_ICON_SLOT_CENTER, FILE_ICON_SLOT_RIGHT],
};

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
  const attachmentCount = task.attachments?.length ?? 0;
  const peekingFiles = (task.attachments || []).slice(0, 3);
  const peekingFileSlots = FILE_ICON_SLOTS_BY_COUNT[peekingFiles.length] || [];
  const [hoveredFileId, setHoveredFileId] = useState<string | null>(null);

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

          {thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail.url}
              alt={thumbnail.name}
              className="w-full h-24 object-cover rounded-xl border border-slate-100 mb-3"
            />
          ) : attachmentCount > 0 ? (
            <div className="attach-hover-group relative w-full h-40 rounded-xl border border-slate-100 bg-slate-50/60 mb-3 overflow-hidden">
              <div className="folder-hover-wrap absolute top-6 left-1/2 w-3/5">
                <FolderIcon className="folder-pop-in w-full">
                  {peekingFiles.map((file, i) => {
                    const slot = peekingFileSlots[i];
                    if (!slot) return null;
                    const variant = fileTypeVariant(file.extension);
                    const height = slot.targetHeight;
                    const width = height * FILE_ICON_ASPECT[variant];
                    const x = slot.centerX - width / 2;
                    const origin = slot.rotate !== 0 ? `${slot.centerX}px ${slot.y + height}px` : undefined;
                    const isHovered = hoveredFileId === file.id;
                    return (
                      <g
                        key={file.id}
                        className="file-icon-pop-in"
                        style={{
                          animationDelay: `${slot.delay}ms`,
                          ...(origin ? { transformOrigin: origin } : {}),
                          "--file-rotate": `${slot.rotate}deg`,
                        } as CSSProperties}
                      >
                        <g
                          className="file-hover-spread"
                          style={{
                            "--file-spread-x": `${slot.hoverSpreadX}px`,
                            "--file-spread-y": `${slot.hoverSpreadY}px`,
                          } as CSSProperties}
                          onMouseEnter={() => setHoveredFileId(file.id)}
                          onMouseLeave={() => setHoveredFileId((current) => (current === file.id ? null : current))}
                        >
                          <FileTypeIcon variant={variant} x={x} y={slot.y} width={width} height={height} />
                          <foreignObject x={slot.centerX - 100} y={slot.y - 30} width={200} height={26} className="pointer-events-none">
                            <div
                              {...{ xmlns: "http://www.w3.org/1999/xhtml" }}
                              className={clsx("file-tooltip flex justify-center", isHovered && "file-tooltip-visible")}
                            >
                              <span className="max-w-[140px] truncate rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                                {file.name}
                              </span>
                            </div>
                          </foreignObject>
                        </g>
                      </g>
                    );
                  })}
                </FolderIcon>
              </div>
            </div>
          ) : null}

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
