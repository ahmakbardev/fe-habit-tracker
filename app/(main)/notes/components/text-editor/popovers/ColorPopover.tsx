"use client";

import { PopoverContent } from "@/components/ui/popover";
import clsx from "clsx";

type Props = {
  onSelectColor: (colorClass: string) => void;
  onSelectHighlight: (bgClass: string) => void;
};

// Preset Warna Tailwind
const TEXT_COLORS = [
  { label: "Default", class: "text-slate-700", bg: "bg-slate-700" },
  { label: "Gray", class: "text-gray-500", bg: "bg-gray-500" },
  { label: "Red", class: "text-red-600", bg: "bg-red-600" },
  { label: "Orange", class: "text-orange-600", bg: "bg-orange-600" },
  { label: "Yellow", class: "text-yellow-600", bg: "bg-yellow-600" },
  { label: "Green", class: "text-green-600", bg: "bg-green-600" },
  { label: "Blue", class: "text-blue-600", bg: "bg-blue-600" },
  { label: "Purple", class: "text-purple-600", bg: "bg-purple-600" },
  { label: "Pink", class: "text-pink-600", bg: "bg-pink-600" },
];

const HIGHLIGHT_COLORS = [
  {
    label: "None",
    class: "bg-transparent",
    bg: "bg-white border border-slate-200",
  },
  { label: "Gray", class: "bg-gray-200", bg: "bg-gray-200" },
  { label: "Red", class: "bg-red-200", bg: "bg-red-200" },
  { label: "Orange", class: "bg-orange-200", bg: "bg-orange-200" },
  { label: "Yellow", class: "bg-yellow-200", bg: "bg-yellow-200" },
  { label: "Green", class: "bg-green-200", bg: "bg-green-200" },
  { label: "Blue", class: "bg-blue-200", bg: "bg-blue-200" },
  { label: "Purple", class: "bg-purple-200", bg: "bg-purple-200" },
  { label: "Pink", class: "bg-pink-200", bg: "bg-pink-200" },
];

export default function ColorPopover({
  onSelectColor,
  onSelectHighlight,
}: Props) {
  return (
    <PopoverContent
      align="start"
      className="w-64 p-3 bg-white shadow-xl rounded-xl border border-slate-100"
    >
      {/* TEXT COLORS */}
      <div className="mb-3">
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
          Text Color
        </div>
        <div className="grid grid-cols-5 gap-1">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.label}
              onClick={() => onSelectColor(c.class)}
              className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center transition"
              title={c.label}
            >
              <div className={clsx("w-4 h-4 rounded-full", c.bg)} />
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-100 my-2" />

      {/* HIGHLIGHTS */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">
          Highlight
        </div>
        <div className="grid grid-cols-5 gap-1">
          {HIGHLIGHT_COLORS.map((c) => (
            <button
              key={c.label}
              onClick={() => onSelectHighlight(c.class)}
              className="w-8 h-8 rounded hover:bg-slate-100 flex items-center justify-center transition"
              title={c.label}
            >
              <div className={clsx("w-4 h-4 rounded-sm", c.bg)} />
            </button>
          ))}
        </div>
      </div>
    </PopoverContent>
  );
}
