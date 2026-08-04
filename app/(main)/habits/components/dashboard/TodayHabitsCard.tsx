"use client";

import { useMemo, useState } from "react";
import { Plus, Check, Flame, X, Circle } from "lucide-react";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "../habit-types";
import { formatTimeLabel, getScheduledSlots } from "./dashboard-utils";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
  onToggle: (habitId: string, date: Date, slot: string) => void;
  onAddHabitClick: () => void;
};

function getCurrentWeek(): Date[] {
  const today = new Date();
  const day = today.getDay();
  const diffToMonday = today.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(today);
  monday.setDate(diffToMonday);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function TodayHabitsCard({ habits, completionData, onToggle, onAddHabitClick }: Props) {
  const week = useMemo(getCurrentWeek, []);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const todayStr = formatDateLocal(new Date());
  const selectedStr = formatDateLocal(selectedDate);

  const rows = useMemo(() => {
    const selectedMidnight = new Date(selectedDate);
    selectedMidnight.setHours(0, 0, 0, 0);

    return habits
      .filter((h) => new Date(h.createdAt).setHours(0, 0, 0, 0) <= selectedMidnight.getTime())
      .flatMap((h) =>
        getScheduledSlots(h).map((slot) => ({
          habit: h,
          slot,
          done: completionData[`${h.id}-${selectedStr}-${slot}`] === 1,
        }))
      )
      .sort((a, b) => a.slot.localeCompare(b.slot));
  }, [habits, completionData, selectedDate, selectedStr]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">
          {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h4>
        <button
          onClick={onAddHabitClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-bold hover:bg-slate-800 transition-colors"
        >
          <Plus size={13} /> Add Habit
        </button>
      </div>

      <div className="flex justify-between mt-4">
        {week.map((d) => {
          const dStr = formatDateLocal(d);
          const isSelected = dStr === selectedStr;
          const isToday = dStr === todayStr;
          return (
            <button
              key={dStr}
              onClick={() => setSelectedDate(new Date(d))}
              className={`w-9 h-14 rounded-xl flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors ${
                isSelected
                  ? isToday
                    ? "bg-orange-500 text-white"
                    : "bg-slate-900 text-white"
                  : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              <span className="text-[9px] uppercase tracking-wide opacity-80">
                {d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3)}
              </span>
              <span className="flex items-center gap-0.5">
                {isSelected && isToday && <Flame size={10} />}
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-1.5 flex-1 overflow-y-auto">
        {rows.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8">No habits scheduled for this day.</p>
        )}
        {rows.map(({ habit, slot, done }) => (
          <button
            key={`${habit.id}-${slot}`}
            onClick={() => onToggle(habit.id, selectedDate, slot)}
            className="w-full flex items-center justify-between gap-3 py-1.5 px-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${habit.color}`}>
                {habit.iconType === "x" ? (
                  <X size={14} className="text-white" strokeWidth={3} />
                ) : (
                  <Circle size={9} className="text-white" fill="currentColor" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{habit.name}</p>
                <p className="text-[11px] text-slate-400">{formatTimeLabel(slot)}</p>
              </div>
            </div>
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200 text-transparent"
              }`}
            >
              <Check size={13} strokeWidth={3} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
