"use client";

import { useMemo, useState } from "react";
import { Flame, ChevronDown } from "lucide-react";
import { Habit } from "../habit-types";
import { computeDayStat } from "./dashboard-utils";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
};

const DAYS_SHOWN = 14;

export default function HabitStreakCard({ habits, completionData }: Props) {
  const [period, setPeriod] = useState<"Monthly" | "Yearly">("Monthly");

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_SHOWN }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (DAYS_SHOWN - 1 - i));
      return computeDayStat(habits, completionData, d);
    });
  }, [habits, completionData]);

  const todayStr = new Date().toDateString();

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-slate-700">Habit streak</h4>
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-500">
            This month <ChevronDown size={12} />
          </button>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(["Monthly", "Yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-colors ${
                period === p ? "bg-white shadow-sm text-slate-800" : "text-slate-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex justify-between gap-1.5 overflow-x-auto pb-1">
        {days.map((day) => {
          const isToday = day.date.toDateString() === todayStr;
          const hasData = day.total > 0;
          const done = hasData && day.ratio === 1;
          const missed = hasData && day.ratio === 0 && !isToday;

          return (
            <div key={day.dateStr} className="flex flex-col items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-semibold text-slate-400">{day.date.getDate()}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isToday
                    ? "bg-orange-500 border-orange-500 text-white"
                    : done
                    ? "bg-emerald-50 border-emerald-400 text-emerald-500"
                    : missed
                    ? "bg-rose-50 border-rose-300 text-rose-400"
                    : "bg-slate-50 border-slate-200 text-slate-300"
                }`}
              >
                {isToday ? (
                  <Flame size={14} />
                ) : done ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                ) : missed ? (
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
