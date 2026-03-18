"use client";

import { useState, useMemo, ComponentPropsWithoutRef } from "react";
import { PopoverContent } from "@/components/ui/popover";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

type Props = {
  onCreate: (workspace: { label: string; icon: LucideIcon }) => void;
} & ComponentPropsWithoutRef<typeof PopoverContent>;

export default function CreateWorkspacePopover({ onCreate, className, ...props }: Props) {
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<LucideIcon>(
    Icons.LayoutGrid
  );

  const allIcons = useMemo(() => {
    const seen = new Set();
    const iconEntries = Object.entries(Icons) as [string, LucideIcon][];

    return iconEntries.filter(([name, Icon]) => {
      if (!name.toLowerCase().includes(search.toLowerCase())) return false;
      if (name === "createLucideIcon" || name === "icons" || name === "default")
        return false;

      if (seen.has(Icon)) return false;
      seen.add(Icon);
      return true;
    });
  }, [search]);

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
    <PopoverContent 
      className={clsx("w-72 p-4 rounded-xl border bg-white shadow-lg", className)} 
      {...props}
    >
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
          className="mt-1 w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring focus:ring-slate-100 focus:border-slate-300"
          placeholder="Workspace name..."
        />
      </div>

      {/* SEARCH ICON */}
      <div className="mb-2">
        <label className="text-xs font-medium text-slate-500">Icon</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring focus:ring-slate-100 focus:border-slate-300"
          placeholder="Search icons..."
        />
      </div>

      {/* ICON LIST */}
      <div className="h-40 overflow-y-auto grid grid-cols-4 gap-2 p-1 custom-scrollbar">
        {allIcons.slice(0, 80).map(([name, Icon]) => (
          <button
            key={name}
            onClick={() => setSelectedIcon(Icon)}
            className={clsx(
              "p-2 border rounded-md flex items-center justify-center hover:bg-slate-50 transition",
              selectedIcon === Icon ? "border-black bg-slate-100" : "border-slate-100"
            )}
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
        className="mt-4 w-full py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-slate-800 transition active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Create Workspace
      </button>
    </PopoverContent>
  );
}
