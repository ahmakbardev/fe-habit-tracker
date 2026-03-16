"use client";
import { Check, ShieldCheck, MoreHorizontal, Clock } from "lucide-react";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "./habit-types";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
  onToggleToday: (id: number, time?: string) => void;
};

export default function HabitActions({
  habits,
  completionData,
  onToggleToday,
}: Props) {
  const todayStr = formatDateLocal(new Date());

  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">
        Quick Check-in
      </h3>
      {habits.map((habit: Habit) => {
        const isPeriodic = habit.schedules && habit.schedules.length > 0;

        // Untuk habit berkala, kita tampilkan list jamnya
        if (isPeriodic) {
          return (
            <div
              key={habit.id}
              className="bg-white border border-gray-100 p-6 rounded-[2.5rem] space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      habit.color
                    } bg-opacity-10 ${habit.color.replace("bg-", "text-")}`}
                  >
                    <Clock size={18} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">
                    {habit.name}
                  </h4>
                </div>
                <MoreHorizontal size={18} className="text-gray-300" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {habit.schedules.map((time: string) => {
                  const isDone =
                    completionData[`${habit.id}-${todayStr}-${time}`] === 1;
                  return (
                    <button
                      key={time}
                      onClick={() => onToggleToday(habit.id, time)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                        isDone
                          ? `${habit.color} text-white border-transparent`
                          : "bg-gray-50 text-gray-400 border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }

        // Untuk habit harian biasa
        const isDone = completionData[`${habit.id}-${todayStr}-daily`] === 1;
        return (
          <div
            key={habit.id}
            onClick={() => onToggleToday(habit.id, "daily")}
            className={`group cursor-pointer p-4 rounded-[2.2rem] border transition-all duration-500 flex items-center justify-between ${
              isDone
                ? "bg-white border-blue-100 shadow-xl"
                : "bg-white border-gray-100 hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                  isDone
                    ? habit.color + " text-white scale-110 shadow-lg"
                    : "bg-gray-50 text-gray-400"
                }`}
              >
                {habit.iconType === "x" ? (
                  <ShieldCheck size={20} />
                ) : (
                  <Check size={20} />
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 text-sm">
                  {habit.name}
                </h4>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                  Daily
                </p>
              </div>
            </div>
            <button className="p-2 text-gray-300 hover:text-gray-600">
              <MoreHorizontal size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
