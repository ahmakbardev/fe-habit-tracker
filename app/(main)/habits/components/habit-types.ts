// app/(main)/habits/components/habit-types.ts

export type Habit = {
  id: string;
  name: string;
  iconType: string;
  color: string;
  goal: number;
  createdAt: string;
  schedules: string[];
};
