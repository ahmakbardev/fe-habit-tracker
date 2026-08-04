"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { NotebookPen, ClipboardCheck, UserRound } from "lucide-react";
import { ProfileData } from "@/lib/profile-service";
import { Habit } from "../habit-types";
import { computeDayStat, computeCurrentStreak } from "./dashboard-utils";

const SESSION_SECONDS = 10 * 60;

function formatCountdown(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function computeProfileCompleteness(profile: ProfileData | null): number {
  if (!profile) return 0;
  const fields = [
    profile.avatar_url,
    profile.bio,
    profile.job_title,
    profile.company,
    profile.phone_mobile,
    profile.mailing_address,
    profile.timezone,
    profile.birthday,
    profile.username,
    profile.tags && profile.tags.length > 0 ? "y" : null,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function QuietTimeCard() {
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => {
    if (secondsLeft === 0) setSecondsLeft(SESSION_SECONDS);
    setIsRunning(true);
  };

  const handleCancel = () => {
    setIsRunning(false);
    setSecondsLeft(SESSION_SECONDS);
  };

  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-sky-500 via-blue-600 to-blue-800 text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.55)] relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -bottom-12 -left-8 w-28 h-28 bg-sky-300/20 rounded-full blur-2xl" />
      <p className="text-xs font-bold text-sky-100 relative">Focus Session</p>
      <p className="text-2xl font-black tracking-tight mt-1 relative tabular-nums">
        {formatCountdown(secondsLeft)}
      </p>
      <div className="flex gap-2 mt-3 relative">
        <button
          onClick={handleCancel}
          className="flex-1 py-2 rounded-lg bg-white/15 text-xs font-bold hover:bg-white/25 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleStart}
          disabled={isRunning}
          className="flex-1 py-2 rounded-lg bg-slate-900 text-xs font-bold hover:bg-slate-800 transition-colors disabled:opacity-60"
        >
          {isRunning ? "Running…" : "Start Session"}
        </button>
      </div>
    </div>
  );
}

function InsightCard({ habits, completionData }: { habits: Habit[]; completionData: Record<string, number> }) {
  const { message, tone } = useMemo(() => {
    const today = computeDayStat(habits, completionData, new Date());
    const streak = computeCurrentStreak(habits, completionData);

    if (today.total === 0) {
      return { message: "Add your first habit to start building consistency.", tone: "neutral" as const };
    }
    if (today.ratio === 1) {
      return {
        message: streak > 1 ? `All done today — ${streak} day streak. Keep it going!` : "All habits done today. Great start!",
        tone: "good" as const,
      };
    }
    if (today.ratio >= 0.5) {
      return { message: `You're over halfway there — ${today.total - today.completed} left today.`, tone: "neutral" as const };
    }
    if (today.completed > 0) {
      return { message: `${today.completed} of ${today.total} done. Keep the momentum going.`, tone: "neutral" as const };
    }
    return { message: "No check-ins yet today — start with one small habit.", tone: "low" as const };
  }, [habits, completionData]);

  const toneStyles = {
    good: "from-emerald-100 via-teal-50 to-sky-50 text-emerald-700",
    neutral: "from-indigo-100 via-violet-50 to-sky-50 text-indigo-700",
    low: "from-amber-100 via-orange-50 to-rose-50 text-amber-700",
  } as const;

  return (
    <div className={`rounded-2xl p-4 bg-gradient-to-br border border-white shadow-sm ${toneStyles[tone]}`}>
      <p className="text-xs font-semibold leading-snug">{message}</p>
    </div>
  );
}

type Props = {
  firstName: string;
  profile: ProfileData | null;
  habits: Habit[];
  completionData: Record<string, number>;
};

export default function WidgetRail({ firstName, profile, habits, completionData }: Props) {
  const completeness = computeProfileCompleteness(profile);

  return (
    <div className="w-full lg:w-[240px] shrink-0 space-y-3">
      <div>
        <p className="text-sm text-slate-400 font-medium">Hi {firstName},</p>
        <h2 className="text-xl font-bold text-slate-800 leading-tight mt-0.5">
          Let&apos;s build consistency today
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/notes"
          className="relative rounded-2xl p-3 h-24 flex flex-col justify-between shadow-[0_8px_20px_-8px_rgba(79,70,229,0.45)] overflow-hidden bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 hover:brightness-105 transition-all"
        >
          <NotebookPen size={16} className="text-white/70" />
          <div>
            <p className="text-xl font-black leading-none text-white">{profile?.stats.notes ?? "–"}</p>
            <p className="text-[11px] font-medium text-white/70 mt-1">Notes</p>
          </div>
        </Link>

        <Link
          href="/tasks"
          className="relative rounded-2xl p-3 h-24 flex flex-col justify-between shadow-[0_8px_20px_-8px_rgba(217,119,6,0.45)] overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-orange-700 hover:brightness-105 transition-all"
        >
          <ClipboardCheck size={16} className="text-white/70" />
          <div>
            <p className="text-xl font-black leading-none text-white">{profile?.stats.tasks ?? "–"}</p>
            <p className="text-[11px] font-medium text-white/70 mt-1">Tasks</p>
          </div>
        </Link>
      </div>

      <Link
        href="/profile"
        className="rounded-2xl p-3 bg-white border border-slate-100 shadow-sm flex items-center gap-3 hover:border-slate-200 transition-colors"
      >
        <div className="relative shrink-0 w-11 h-11">
          <svg viewBox="0 0 44 44" className="w-11 h-11 -rotate-90">
            <circle cx="22" cy="22" r="18" fill="none" stroke="#eef2f7" strokeWidth="4" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#4f46e5"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={2 * Math.PI * 18 * (1 - completeness / 100)}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserRound size={16} className="text-indigo-500" />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 truncate">Profile</p>
          <p className="text-[11px] text-slate-400 truncate">{completeness}% complete</p>
        </div>
      </Link>

      <QuietTimeCard />

      <InsightCard habits={habits} completionData={completionData} />
    </div>
  );
}
