"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import clsx from "clsx";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

/** Above this many options, a search box is shown to filter the list. */
const SEARCH_THRESHOLD = 8;

export type SelectOption = { id: string; label: string };

type Props = {
  value: string;
  options: SelectOption[];
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  renderValue?: (val: string) => React.ReactNode;
  triggerClassName?: string;
  disabled?: boolean;
  /** "boxed" (default): bordered field, for forms.
   *  "minimal": bare text + small chevron, for inline metadata rows. */
  variant?: "boxed" | "minimal";
  align?: "start" | "center" | "end";
};

/**
 * Popover-based dropdown replacing a native <select>. Used everywhere a
 * task/project field needs a fixed set of choices.
 */
export default function CustomSelect({
  value,
  options,
  onChange,
  placeholder = "Select...",
  label,
  renderValue,
  triggerClassName,
  disabled,
  variant = "boxed",
  align = "start",
}: Props) {
  const selected = options.find((o) => o.id === value);
  const [query, setQuery] = useState("");
  const showSearch = options.length > SEARCH_THRESHOLD;
  const filteredOptions = useMemo(() => {
    if (!showSearch || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, query, showSearch]);

  return (
    <Popover onOpenChange={(open) => !open && setQuery("")}>
      <PopoverTrigger asChild>
        {variant === "minimal" ? (
          <button
            type="button"
            disabled={disabled}
            className={clsx("flex items-center gap-1.5 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed", triggerClassName)}
          >
            {selected ? (
              renderValue ? renderValue(value) : <span className="text-xs font-bold text-slate-700">{selected.label}</span>
            ) : (
              <span className="text-xs font-medium text-slate-400">{placeholder}</span>
            )}
            <ChevronDown size={12} className="text-slate-300" />
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            className={clsx(
              "flex items-center justify-between w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed",
              triggerClassName
            )}
          >
            <div className="flex-1 truncate">
              {selected ? (
                renderValue ? renderValue(value) : <span className="text-sm font-medium text-slate-700">{selected.label}</span>
              ) : (
                <span className="text-sm text-slate-400">{placeholder}</span>
              )}
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-2 shrink-0" />
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-56 p-1 shadow-2xl border-slate-100" align={align}>
        {label && (
          <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">{label}</p>
        )}
        {showSearch && (
          <div className="relative mb-1 px-1">
            <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>
        )}
        <div className="max-h-60 overflow-y-auto">
          {filteredOptions.length === 0 && <p className="px-3 py-4 text-xs text-slate-400 italic text-center">No options found</p>}
          {filteredOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={clsx(
                "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all mb-0.5",
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
}
