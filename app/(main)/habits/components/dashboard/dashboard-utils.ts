import { formatDateLocal } from "@/lib/utils";
import { Habit } from "../habit-types";

export interface DayStat {
  date: Date;
  dateStr: string;
  completed: number;
  total: number;
  ratio: number;
}

export function getScheduledSlots(habit: Habit): string[] {
  return habit.schedules && habit.schedules.length > 0 ? habit.schedules : ["daily"];
}

function isHabitActiveOn(habit: Habit, date: Date): boolean {
  const createdAt = new Date(habit.createdAt);
  createdAt.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return createdAt.getTime() <= target.getTime();
}

export function computeDayStat(
  habits: Habit[],
  completionData: Record<string, number>,
  date: Date
): DayStat {
  const dateStr = formatDateLocal(date);
  let total = 0;
  let completed = 0;

  habits.forEach((habit) => {
    if (!isHabitActiveOn(habit, date)) return;
    getScheduledSlots(habit).forEach((slot) => {
      total += 1;
      if (completionData[`${habit.id}-${dateStr}-${slot}`] === 1) completed += 1;
    });
  });

  return { date, dateStr, completed, total, ratio: total === 0 ? 0 : completed / total };
}

export function formatTimeLabel(time: string): string {
  if (time === "daily") return "Daily";
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  const hour = Number(match[1]);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${match[2]} ${period}`;
}

export function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return "there";
  return fullName.trim().split(/\s+/)[0];
}

export function countHabitCompletions(
  habit: Habit,
  completionData: Record<string, number>,
  from: Date,
  to: Date
): number {
  let count = 0;
  const cursor = new Date(from);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const dateStr = formatDateLocal(cursor);
    getScheduledSlots(habit).forEach((slot) => {
      if (completionData[`${habit.id}-${dateStr}-${slot}`] === 1) count += 1;
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return count;
}

export function countAllCompletions(
  habits: Habit[],
  completionData: Record<string, number>,
  from: Date,
  to: Date
): number {
  return habits.reduce((sum, h) => sum + countHabitCompletions(h, completionData, from, to), 0);
}

/** Consecutive fully-completed days ending today. Days with no scheduled
 * habits (before any habit existed) are skipped rather than breaking the streak. */
export function computeCurrentStreak(habits: Habit[], completionData: Record<string, number>): number {
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow today to still be "in progress" without breaking yesterday's streak.
  const todayStat = computeDayStat(habits, completionData, cursor);
  if (todayStat.total > 0 && todayStat.ratio < 1) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const stat = computeDayStat(habits, completionData, cursor);
    if (stat.total === 0) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (stat.ratio < 1) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}
