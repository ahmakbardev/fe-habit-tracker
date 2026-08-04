"use client";

import { useMemo } from "react";
import { Target, Flame, CalendarCheck2, TrendingUp, TrendingDown } from "lucide-react";
import { Habit } from "../habit-types";
import { computeDayStat, computeCurrentStreak, countAllCompletions } from "./dashboard-utils";

type StatProps = {
  habits: Habit[];
  completionData: Record<string, number>;
};

function RingGauge({ percent, size = 56 }: { percent: number; size?: number }) {
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;
  const gradientId = "completionRingGradient";

  return (
    <svg width={size} height={size} className="-rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#eef2f7" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function CompletionRateCard({ habits, completionData }: StatProps) {
  const { today, yesterday } = useMemo(() => {
    const now = new Date();
    const yest = new Date(now);
    yest.setDate(now.getDate() - 1);
    return {
      today: computeDayStat(habits, completionData, now),
      yesterday: computeDayStat(habits, completionData, yest),
    };
  }, [habits, completionData]);

  const percent = Math.round(today.ratio * 100);
  const deltaPoints = Math.round((today.ratio - yesterday.ratio) * 100);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Completion rate</h4>
        <Target size={14} className="text-slate-300" />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-2xl font-black text-slate-800 leading-none">{percent}%</p>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5">
            {today.total > 0 ? `${today.completed}/${today.total} done today` : "No habits scheduled"}
          </p>
          {yesterday.total > 0 && (
            <p
              className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
                deltaPoints >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {deltaPoints >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {deltaPoints === 0 ? "Same as" : `${deltaPoints > 0 ? "+" : ""}${deltaPoints}% vs`} yesterday
            </p>
          )}
        </div>
        <RingGauge percent={percent} />
      </div>
    </div>
  );
}

export function StreakCard({ habits, completionData }: StatProps) {
  const { streak, lastDays } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return computeDayStat(habits, completionData, d);
    });
    return { streak: computeCurrentStreak(habits, completionData), lastDays: days };
  }, [habits, completionData]);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Current streak</h4>
        <Flame size={14} className="text-slate-300" />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-800">{streak}</span>
        <span className="text-xs text-slate-400 font-semibold">{streak === 1 ? "day" : "days"}</span>
      </div>
      <p className="text-[10px] text-slate-400 font-medium mt-1">
        {streak > 0 ? "Fully completed in a row" : "Complete all habits today to start"}
      </p>

      <div className="flex items-end gap-1.5 mt-3 h-8">
        {lastDays.map((d) => (
          <div
            key={d.dateStr}
            className={`flex-1 rounded-sm ${
              d.total === 0
                ? "bg-slate-100 h-1.5"
                : d.ratio === 1
                ? "bg-orange-500 h-full"
                : d.ratio > 0
                ? "bg-orange-200 h-1/2"
                : "bg-slate-200 h-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function WeeklyCheckinsCard({ habits, completionData }: StatProps) {
  const { thisWeek, change, dailyCounts } = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    const prevWeekEnd = new Date(weekStart);
    prevWeekEnd.setDate(weekStart.getDate() - 1);
    const prevWeekStart = new Date(prevWeekEnd);
    prevWeekStart.setDate(prevWeekEnd.getDate() - 6);

    const thisWeekTotal = countAllCompletions(habits, completionData, weekStart, today);
    const lastWeekTotal = countAllCompletions(habits, completionData, prevWeekStart, prevWeekEnd);
    const changePercent =
      lastWeekTotal === 0 ? (thisWeekTotal > 0 ? 100 : 0) : Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100);

    const counts = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return computeDayStat(habits, completionData, d).completed;
    });

    return { thisWeek: thisWeekTotal, change: changePercent, dailyCounts: counts };
  }, [habits, completionData]);

  const maxCount = Math.max(1, ...dailyCounts);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_14px_-6px_rgba(15,23,42,0.08)] h-full">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-700">Check-ins this week</h4>
        <CalendarCheck2 size={14} className="text-slate-300" />
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-black text-slate-800">{thisWeek}</span>
      </div>
      <p
        className={`text-[10px] font-semibold mt-1 flex items-center gap-1 ${
          change >= 0 ? "text-emerald-500" : "text-rose-500"
        }`}
      >
        {change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
        {change >= 0 ? "+" : ""}
        {change}% vs last week
      </p>

      <div className="flex items-end gap-1.5 mt-3 h-8">
        {dailyCounts.map((c, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-indigo-400"
            style={{ height: `${Math.max(10, (c / maxCount) * 100)}%` }}
          />
        ))}
      </div>
    </div>
  );
}
