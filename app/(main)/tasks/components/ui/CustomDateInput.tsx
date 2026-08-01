"use client";

import { useMemo, useState } from "react";
import { Calendar as CalendarIcon, CalendarClock, ChevronLeft, ChevronRight, Clock, ChevronDown } from "lucide-react";
import clsx from "clsx";
import {
  format,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  setHours,
  setMinutes,
} from "date-fns";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type Props = {
  value: string; // "YYYY-MM-DD" for mode="date", "YYYY-MM-DD HH:mm" for mode="datetime"
  onChange: (val: string) => void;
  mode?: "date" | "datetime";
  label?: string;
  placeholder?: string;
  className?: string;
  /** "boxed" (default): full field with icon+label+value, for forms.
   *  "inline": just the value as clickable text, for metadata rows that
   *  already render their own icon/label on the left. */
  variant?: "boxed" | "inline";
};

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES_5 = Array.from({ length: 12 }, (_, i) => i * 5);

function parseValue(value: string, mode: "date" | "datetime"): Date | null {
  if (!value) return null;
  const iso = mode === "datetime" ? value.replace(" ", "T") : value;
  const date = new Date(iso);
  return isValid(date) ? date : null;
}

function formatDisplay(date: Date | null, mode: "date" | "datetime"): string | null {
  if (!date) return null;
  return format(date, mode === "datetime" ? "MMM d, yyyy h:mm a" : "MMM d, yyyy");
}

function toValue(date: Date, mode: "date" | "datetime"): string {
  return mode === "datetime" ? format(date, "yyyy-MM-dd HH:mm") : format(date, "yyyy-MM-dd");
}

/** Small popover dropdown used for the hour/minute/period fields. */
function MiniDropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (val: string) => void;
}) {
  const selected = options.find((o) => o.id === value);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex-1 flex items-center justify-center gap-1 px-1.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-blue-300 transition-colors"
        >
          {selected?.label ?? "--"}
          <ChevronDown size={10} className="text-slate-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-16 p-1 shadow-2xl border-slate-100" align="center">
        <div className="max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={clsx(
                "w-full text-center px-2 py-1.5 text-xs font-semibold rounded-md transition-all mb-0.5",
                value === opt.id ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Fully custom date / datetime picker — a real calendar grid rendered in a
 * popover, plus custom hour/minute/AM-PM dropdowns for datetime mode.
 * No native <input type="date"/"datetime-local"> anywhere.
 */
export default function CustomDateInput({ value, onChange, mode = "date", label, placeholder = "Set date", className, variant = "boxed" }: Props) {
  const selected = parseValue(value, mode);
  const [viewMonth, setViewMonth] = useState(() => selected || new Date());
  const display = formatDisplay(selected, mode);
  const Icon = mode === "datetime" ? CalendarClock : CalendarIcon;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(viewMonth));
    const end = endOfWeek(endOfMonth(viewMonth));
    return eachDayOfInterval({ start, end });
  }, [viewMonth]);

  const commit = (date: Date) => onChange(toValue(date, mode));

  const handleDayClick = (day: Date) => {
    const base = selected || new Date(day.getFullYear(), day.getMonth(), day.getDate(), 9, 0);
    const next = mode === "datetime" ? setMinutes(setHours(day, base.getHours()), base.getMinutes()) : day;
    commit(next);
  };

  const hour24 = selected ? selected.getHours() : 9;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const minute5 = selected ? selected.getMinutes() - (selected.getMinutes() % 5) : 0;

  const handleHourChange = (h12: string) => {
    const base = selected || new Date();
    let h24 = Number(h12) % 12;
    if (period === "PM") h24 += 12;
    commit(setHours(base, h24));
  };

  const handleMinuteChange = (m: string) => {
    const base = selected || new Date();
    commit(setMinutes(base, Number(m)));
  };

  const handlePeriodChange = (p: string) => {
    const base = selected || new Date();
    let h24 = base.getHours() % 12;
    if (p === "PM") h24 += 12;
    commit(setHours(base, h24));
  };

  const openTrigger = () => setViewMonth(selected || new Date());

  const trigger = variant === "inline" ? (
    <button
      type="button"
      onClick={openTrigger}
      className={clsx("text-xs font-bold text-right outline-none transition hover:text-blue-600", display ? "text-slate-600" : "text-slate-400 font-medium")}
    >
      {display || placeholder}
    </button>
  ) : (
    <button
      type="button"
      onClick={openTrigger}
      className="group flex items-center gap-2.5 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-300 hover:bg-white transition-all text-left"
    >
      <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        {label && <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{label}</p>}
        <p className={clsx("text-sm font-semibold truncate", display ? "text-slate-700" : "text-slate-400 font-normal")}>
          {display || placeholder}
        </p>
      </div>
    </button>
  );

  return (
    <Popover onOpenChange={(open) => open && openTrigger()}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className={clsx("w-72 p-3 shadow-2xl border-slate-100", className)} align={variant === "inline" ? "end" : "start"}>
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={() => setViewMonth((m) => subMonths(m, 1))} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <p className="text-xs font-black text-slate-700">{format(viewMonth, "MMMM yyyy")}</p>
          <button type="button" onClick={() => setViewMonth((m) => addMonths(m, 1))} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-[9px] font-bold text-slate-400 text-center py-1 uppercase">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const inMonth = isSameMonth(day, viewMonth);
            const isSelected = !!selected && isSameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                className={clsx(
                  "h-7 w-7 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center",
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : isToday(day)
                      ? "text-blue-600 bg-blue-50"
                      : inMonth
                        ? "text-slate-600 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-50"
                )}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        {mode === "datetime" && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2 text-slate-400">
              <Clock size={12} />
              <p className="text-[9px] font-black uppercase tracking-wider">Time</p>
            </div>
            <div className="flex items-center gap-1.5">
              <MiniDropdown
                value={String(hour12)}
                options={HOURS_12.map((h) => ({ id: String(h), label: String(h).padStart(2, "0") }))}
                onChange={handleHourChange}
              />
              <span className="text-slate-300 font-black">:</span>
              <MiniDropdown
                value={String(minute5)}
                options={MINUTES_5.map((m) => ({ id: String(m), label: String(m).padStart(2, "0") }))}
                onChange={handleMinuteChange}
              />
              <MiniDropdown
                value={period}
                options={[{ id: "AM", label: "AM" }, { id: "PM", label: "PM" }]}
                onChange={handlePeriodChange}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
