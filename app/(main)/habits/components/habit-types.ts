// app/(main)/habits/components/habit-types.ts

export type Habit = {
  id: number;
  name: string;
  iconType: string;
  color: string;
  goal: number;
  createdAt: Date;
  schedules: string[];
};
