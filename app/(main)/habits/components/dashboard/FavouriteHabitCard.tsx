"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Habit } from "../habit-types";
import { countHabitCompletions } from "./dashboard-utils";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
  windowDays: number;
};

export default function FavouriteHabitCard({ habits, completionData, windowDays }: Props) {
  const stats = useMemo(() => {
    const today = new Date();
    const halfDays = Math.floor(windowDays / 2);

    const windowStart = new Date(today);
    windowStart.setDate(today.getDate() - (windowDays - 1));

    const midPoint = new Date(today);
    midPoint.setDate(today.getDate() - halfDays);
    const midPointPrev = new Date(midPoint);
    midPointPrev.setDate(midPoint.getDate() - 1);

    return habits
      .map((h) => {
        const total = countHabitCompletions(h, completionData, windowStart, today);
        const recent = countHabitCompletions(h, completionData, midPoint, today);
        const earlier = countHabitCompletions(h, completionData, windowStart, midPointPrev);
        const change =
          earlier === 0
            ? recent > 0
              ? 100
              : 0
            : Math.round(((recent - earlier) / earlier) * 100);
        return { habit: h, total, change };
      })
      .sort((a, b) => b.total - a.total);
  }, [habits, completionData, windowDays]);

  const favourite = stats[0];
  const maxTotal = Math.max(1, ...stats.map((s) => s.total));

  if (!favourite || favourite.total === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full flex items-center justify-center">
        <p className="text-xs text-slate-400 text-center">
          Complete a few habits to see your favourite one here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full">
      <h4 className="text-sm font-bold text-slate-700">Favourite habit</h4>

      <div className="mt-8 flex items-end justify-between gap-3 h-28">
        {stats.slice(0, 6).map(({ habit, total }) => {
          const height = Math.max(8, (total / maxTotal) * 100);
          const isFavourite = habit.id === favourite.habit.id;
          return (
            <div key={habit.id} className="relative flex-1 flex flex-col items-center gap-2 h-full justify-end">
              {isFavourite && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border border-slate-100 shadow-md rounded-lg px-3 py-1.5 text-center z-10">
                  <p className="text-xs font-black text-slate-800">{habit.name}</p>
                  <p
                    className={`text-[10px] font-semibold flex items-center gap-1 justify-center ${
                      favourite.change >= 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {favourite.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {favourite.change >= 0 ? "+" : ""}
                    {favourite.change}% vs last period
                  </p>
                </div>
              )}
              <div
                className={`w-full rounded-t-lg transition-all ${isFavourite ? habit.color : "bg-slate-100"}`}
                style={{ height: `${height}%` }}
              />
              <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                {habit.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
