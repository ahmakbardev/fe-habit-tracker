"use client";

import { useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { TaskItem } from "./task-types";
import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import FolderIcon from "@/components/icons/FolderIcon";
import FileTypeIcon from "@/components/icons/FileTypeIcon";
import NoteFileIcon from "@/components/icons/NoteFileIcon";
import ImageFileIcon from "@/components/icons/ImageFileIcon";

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

// xlsx's own artwork is drawn on a square (1:1) viewBox, but sized here at
// the same 0.8 ratio as pdf/doc so all three read as the same page-shaped
// scale — the square art then just letterboxes (SVG's default
// preserveAspectRatio) inside that narrower box instead of stretching.
const FILE_ICON_ASPECT: Record<"pdf" | "xlsx" | "doc", number> = { pdf: 0.8, doc: 0.8, xlsx: 0.8 };

const FILE_ICON_SLOT_LEFT: FileIconSlot = { centerX: 51.5, y: -6, targetHeight: 106, rotate: -9, delay: 680, hoverSpreadX: -10, hoverSpreadY: 4 };
const FILE_ICON_SLOT_CENTER: FileIconSlot = { centerX: 113, y: -18, targetHeight: 118, rotate: 0, delay: 550, hoverSpreadX: 0, hoverSpreadY: -8 };
// Matches FILE_ICON_SLOT_LEFT's targetHeight so the left and right icons
// read as the same size — it previously sat at 72 (noticeably smaller than
// the left slot's 106), which is what made the right-hand icon look off.
const FILE_ICON_SLOT_RIGHT: FileIconSlot = { centerX: 168, y: 7, targetHeight: 106, rotate: 20, delay: 810, hoverSpreadX: 10, hoverSpreadY: -4 };

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
  const attachmentCount = task.attachments?.length ?? 0;
  // Images get their own peeking icon (mirroring notes, on the right) instead
  // of the pdf/xlsx/doc-only in-folder slot system, so they're excluded from
  // peekingFiles here.
  const imageAttachments = (task.attachments || []).filter(
    (a) => a.url && IMAGE_EXTENSIONS.includes(a.extension.toLowerCase())
  );
  const peekingFiles = (task.attachments || [])
    .filter((a) => !(a.url && IMAGE_EXTENSIONS.includes(a.extension.toLowerCase())))
    .slice(0, 3);
  const peekingFileSlots = FILE_ICON_SLOTS_BY_COUNT[peekingFiles.length] || [];
  const linkedNotes = task.notes || [];
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null);
  // Rendered via a portal straight onto <body> (see fileTooltip render
  // below) instead of the <foreignObject> this used to be, so the tooltip
  // isn't clipped by .attach-hover-group's overflow-hidden — that clip has
  // to stay for the folder/peeking-file art itself, so the tooltip needs to
  // escape it rather than the other way around.
  const [fileTooltip, setFileTooltip] = useState<{ id: string; text: string; x: number; y: number } | null>(null);

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

          {attachmentCount > 0 || linkedNotes.length > 0 ? (
            <div className="attach-hover-group relative w-full h-40 rounded-xl border border-slate-100 bg-slate-50/60 mb-3 overflow-hidden">
              <div className="folder-hover-wrap absolute top-6 left-1/2 w-3/5">
                <FolderIcon className="folder-pop-in w-full">
                  <AnimatePresence>
                    {peekingFiles.map((file, i) => {
                      const slot = peekingFileSlots[i];
                      if (!slot) return null;
                      const variant = fileTypeVariant(file.extension);
                      const height = slot.targetHeight;
                      const width = height * FILE_ICON_ASPECT[variant];
                      // Local, untranslated coordinates — the icon and its
                      // tooltip sit at (0, 0) and let the outer motion.g's
                      // x/y/rotate transform place them at the slot instead,
                      // so that slot itself becomes an animatable target
                      // (survivors re-tween into their new slot when one is
                      // removed) rather than a static attribute that snaps.
                      const origin = slot.rotate !== 0 ? `${width / 2}px ${height}px` : undefined;
                      return (
                        <motion.g
                          key={file.id}
                          initial={false}
                          animate={{ x: slot.centerX - width / 2, y: slot.y, rotate: slot.rotate }}
                          exit={{ opacity: 0, scale: 0.4, y: slot.y + 24 }}
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                          style={origin ? { transformOrigin: origin } : undefined}
                        >
                          {/* Vertical pop-in bounce only — position and tilt
                              are owned by the parent motion.g above, so this
                              CSS keyframe doesn't fight it over `transform`. */}
                          <g className="file-icon-pop-in" style={{ animationDelay: `${slot.delay}ms` } as CSSProperties}>
                            <g
                              className="file-hover-spread"
                              style={{
                                "--file-spread-x": `${slot.hoverSpreadX}px`,
                                "--file-spread-y": `${slot.hoverSpreadY}px`,
                              } as CSSProperties}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setFileTooltip({ id: file.id, text: file.name, x: rect.left + rect.width / 2, y: rect.top });
                              }}
                              onMouseLeave={() => {
                                setFileTooltip((current) => (current?.id === file.id ? null : current));
                              }}
                            >
                              <FileTypeIcon variant={variant} x={0} y={0} width={width} height={height} />
                            </g>
                          </g>
                        </motion.g>
                      );
                    })}
                  </AnimatePresence>
                </FolderIcon>
              </div>

              {linkedNotes.length > 0 && (
                // Anchored so the leftmost note's bottom-left corner touches
                // the folder's visible left edge, then lines up rightward
                // as more notes are linked. Pushed slightly below the box's
                // own bottom edge (and clipped by .attach-hover-group's
                // overflow-hidden, same as the folder) so it reads as
                // partially tucked behind the box rather than floating fully
                // in front of it, which also keeps it from covering too much
                // of the folder's face.
                <div className="absolute -bottom-7 left-[8%] z-10 flex -space-x-8">
                  <AnimatePresence initial={false}>
                    {linkedNotes.map((note, i) => {
                      const isHovered = hoveredNoteId === note.id;
                      return (
                        <motion.div
                          key={note.id}
                          layout
                          initial={{ opacity: 0, scale: 0.4, y: 14 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.4, y: 14 }}
                          transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        >
                          {/* Hover-spread stays on a plain inner div — it's
                              driven by the .attach-hover-group:hover CSS rule
                              (transform: translate(--file-spread-x/y)), and
                              keeping it off the motion.div avoids that CSS
                              transform fighting with framer-motion's own
                              transform on the outer layout/enter-exit node. */}
                          <div
                            className="file-hover-spread relative"
                            style={{
                              "--file-spread-x": `${i * 6}px`,
                              "--file-spread-y": "-6px",
                            } as CSSProperties}
                            onMouseEnter={() => setHoveredNoteId(note.id)}
                            onMouseLeave={() => setHoveredNoteId((current) => (current === note.id ? null : current))}
                          >
                            <NoteFileIcon
                              aria-label={note.title}
                              className="w-14 h-auto shrink-0 drop-shadow-md"
                              style={{ transform: "rotate(-8deg)", zIndex: i }}
                            />
                            <div className={clsx("file-tooltip absolute -top-7 left-1/2 -translate-x-1/2 flex justify-center", isHovered && "file-tooltip-visible")}>
                              <span className="max-w-[140px] truncate rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                                {note.title}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}

              {imageAttachments.length > 0 && (
                // Mirrors the notes block above — same "peeking, partially
                // tucked behind the box" treatment — but anchored to the
                // bottom-right instead, growing leftward toward the folder
                // as more images are attached. The array is reversed (rather
                // than reaching for flex-row-reverse) so this stays a plain
                // left-to-right flex row like the notes block: the first
                // image ends up last in DOM order, which is what lands it at
                // the container's right edge — the anchor/touch point — with
                // Tailwind's normal -space-x-8 overlap (no space-x-reverse
                // needed) pulling each later-in-DOM (i.e. earlier original)
                // image left of it, same mechanics as notes just read
                // backwards.
                <div className="absolute -bottom-7 right-[8%] z-10 flex -space-x-8">
                  <AnimatePresence initial={false}>
                    {[...imageAttachments].reverse().map((image, i) => {
                      const isHovered = hoveredImageId === image.id;
                      return (
                        <motion.div
                          key={image.id}
                          layout
                          initial={{ opacity: 0, scale: 0.4, y: 14 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.4, y: 14 }}
                          transition={{ type: "spring", stiffness: 420, damping: 28 }}
                        >
                          <div
                            className="file-hover-spread relative"
                            style={{
                              "--file-spread-x": `${i * -6}px`,
                              "--file-spread-y": "-6px",
                            } as CSSProperties}
                            onMouseEnter={() => setHoveredImageId(image.id)}
                            onMouseLeave={() => setHoveredImageId((current) => (current === image.id ? null : current))}
                          >
                            <ImageFileIcon
                              aria-label={image.name}
                              className="w-14 h-auto shrink-0 drop-shadow-md"
                              style={{ transform: "rotate(8deg)", zIndex: i }}
                            />
                            <div className={clsx("file-tooltip absolute -top-7 left-1/2 -translate-x-1/2 flex justify-center", isHovered && "file-tooltip-visible")}>
                              <span className="max-w-[140px] truncate rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                                {image.name}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
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

          {typeof document !== "undefined" &&
            createPortal(
              <AnimatePresence>
                {fileTooltip && (
                  <motion.div
                    key={fileTooltip.id}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 2 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-[100] pointer-events-none"
                    style={{ left: fileTooltip.x, top: fileTooltip.y, transform: "translate(-50%, calc(-100% - 8px))" }}
                  >
                    <span className="block max-w-[140px] truncate rounded-md bg-slate-800 px-2 py-1 text-[10px] font-medium text-white shadow-md">
                      {fileTooltip.text}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}
        </div>
      )}
    </Draggable>
  );
}
