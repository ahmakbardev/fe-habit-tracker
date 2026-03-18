"use client";

import { useState, useMemo } from "react";
import { PopoverContent } from "@/components/ui/popover";
import * as Icons from "lucide-react";
// 1. Import tipe LucideIcon
import { LucideIcon } from "lucide-react";

type Props = {
  // 2. Ganti 'any' dengan 'LucideIcon'
  onCreate: (workspace: { label: string; icon: LucideIcon }) => void;
};

export default function CreateWorkspacePopover({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  // 3. Ganti 'any' dengan 'LucideIcon' pada state
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon>(
    Icons.LayoutGrid
  );

  const allIcons = useMemo(() => {
    const seen = new Set();

    // 4. Casting Object.entries agar dikenali sebagai array of [string, LucideIcon]
    // Ini menghilangkan kebutuhan 'any' di dalam parameter filter/map
    const iconEntries = Object.entries(Icons) as [string, LucideIcon][];

    return iconEntries.filter(([name, Icon]) => {
      if (!name.toLowerCase().includes(search.toLowerCase())) return false;
      // Filter properti internal library yang bukan icon
      if (name === "createLucideIcon" || name === "icons" || name === "default")
        return false;

      if (seen.has(Icon)) return false;
      seen.add(Icon);
      return true;
    });
  }, [search]);

  // --- LOGIC SUBMIT TERPUSAT ---
  const handleSubmit = () => {
    if (!title.trim()) return;

    onCreate({
      label: title,
      icon: selectedIcon,
    });

    setTitle("");
    setSearch("");
  };

  return (
    <PopoverContent className="w-72 p-4 rounded-xl border bg-white shadow-lg">
      <div className="mb-3">
        <label className="text-xs font-medium text-slate-500">
          Workspace Title
        </label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="mt-1 w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring"
          placeholder="Workspace name..."
        />
      </div>

      {/* SEARCH ICON */}
      <div className="mb-2">
        <label className="text-xs font-medium text-slate-500">Icon</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="mt-1 w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring"
          placeholder="Search icons..."
        />
      </div>

      {/* ICON LIST */}
      <div className="h-40 overflow-y-auto grid grid-cols-4 gap-2 p-1">
        {/* 5. Parameter di sini sekarang sudah otomatis ter-infer sebagai [string, LucideIcon] */}
        {allIcons.slice(0, 60).map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => setSelectedIcon(Icon)}
            className={`p-2 border rounded-md flex items-center justify-center hover:bg-slate-100 transition ${
              selectedIcon === Icon ? "border-black bg-slate-100" : ""
            }`}
            title={name}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </div>

      {/* CONFIRM BUTTON */}
      <button
        disabled={!title.trim()}
        onClick={handleSubmit}
        className="mt-3 w-full py-2 rounded-md bg-black text-white text-sm hover:bg-opacity-80 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create
      </button>
    </PopoverContent>
  );
}
