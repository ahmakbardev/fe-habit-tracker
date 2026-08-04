"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDateLocal } from "@/lib/utils";
import { ProfileService, ProfileData, resolveAvatarUrl } from "@/lib/profile-service";
import { Habit } from "../habit-types";
import { HabitService } from "../../services/habit-service";
import { getFirstName } from "./dashboard-utils";
import WidgetRail from "./WidgetRail";
import { CompletionRateCard, StreakCard, WeeklyCheckinsCard } from "./StatCards";
import TodayHabitsCard from "./TodayHabitsCard";
import HabitStreakCard from "./HabitStreakCard";
import FavouriteHabitCard from "./FavouriteHabitCard";
import TryFeatureCard from "./TryFeatureCard";

const WINDOW_DAYS = 28;

type Props = {
  habits: Habit[];
  onAddHabitClick: () => void;
};

export default function HabitDashboard({ habits, onAddHabitClick }: Props) {
  const [completionData, setCompletionData] = useState<Record<string, number>>({});
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    let mounted = true;

    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - (WINDOW_DAYS - 1));

    HabitService.getCompletions(formatDateLocal(start), formatDateLocal(today))
      .then((data) => {
        if (!mounted) return;
        const map: Record<string, number> = {};
        data.forEach((c) => {
          map[`${c.habit_id}-${c.date}-${c.time_slot}`] = c.status;
        });
        setCompletionData(map);
      })
      .catch(() => mounted && setCompletionData({}));

    ProfileService.get()
      .then((p) => {
        if (mounted) setProfile(p);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleToggle = useCallback(async (habitId: string, date: Date, slot: string) => {
    const dateStr = formatDateLocal(date);
    const key = `${habitId}-${dateStr}-${slot}`;

    setCompletionData((prev) => ({
      ...prev,
      [key]: prev[key] === 1 ? 0 : 1,
    }));

    try {
      await HabitService.toggle(habitId, dateStr, slot);
    } catch {
      setCompletionData((prev) => ({
        ...prev,
        [key]: prev[key] === 1 ? 0 : 1,
      }));
    }
  }, []);

  const firstName = getFirstName(profile?.name);
  const initials = firstName.slice(0, 2).toUpperCase();
  const avatarUrl = profile ? resolveAvatarUrl(profile.avatar_url) : null;

  return (
    <div className="flex flex-col lg:flex-row gap-5 xl:gap-6">
      <WidgetRail firstName={firstName} profile={profile} habits={habits} completionData={completionData} />

      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center justify-end">
          <Link
            href="/profile"
            className="rounded-full hover:ring-2 hover:ring-slate-200 transition-all"
            title={profile?.name ?? "Profile"}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={profile?.name ?? ""} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                {initials}
              </div>
            )}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-stretch">
          <div className="md:col-span-3">
            <CompletionRateCard habits={habits} completionData={completionData} />
          </div>
          <div className="md:col-span-1">
            <StreakCard habits={habits} completionData={completionData} />
          </div>
          <div className="md:col-span-1">
            <WeeklyCheckinsCard habits={habits} completionData={completionData} />
          </div>

          <div className="md:col-span-5">
            <TodayHabitsCard
              habits={habits}
              completionData={completionData}
              onToggle={handleToggle}
              onAddHabitClick={onAddHabitClick}
            />
          </div>

          <div className="md:col-span-5">
            <HabitStreakCard habits={habits} completionData={completionData} />
          </div>

          <div className="md:col-span-3">
            <FavouriteHabitCard habits={habits} completionData={completionData} windowDays={WINDOW_DAYS} />
          </div>
          <div className="md:col-span-2">
            <TryFeatureCard />
          </div>
        </div>
      </div>
    </div>
  );
}
