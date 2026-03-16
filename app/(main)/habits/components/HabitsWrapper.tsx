// app/(main)/habits/components/HabitsWrapper.tsx
"use client";
import { useState } from "react";
import HabitHeader from "./HabitHeader";
import HabitTable from "./HabitTable";
import HabitActions from "./HabitActions";
import AddHabitModal from "./AddHabitModal";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "./habit-types";

export default function HabitsWrapper() {
  const [view, setView] = useState<"Week" | "Month">("Week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      name: "No Alcohol",
      iconType: "x",
      color: "bg-blue-600",
      goal: 1,
      createdAt: new Date("2023-01-01"),
      schedules: [],
    },
    {
      id: 2,
      name: "Drink Water",
      iconType: "circle",
      color: "bg-cyan-400",
      goal: 6,
      createdAt: new Date("2023-01-01"),
      schedules: ["08:00", "10:30", "13:00", "15:30", "18:00", "20:30"],
    },
  ]);

  const [completionData, setCompletionData] = useState<Record<string, number>>(
    {}
  );

  const toggleHabit = (id: number, date: Date, time: string = "daily") => {
    const dateKey = `${id}-${formatDateLocal(date)}-${time}`;
    setCompletionData((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey] === 1 ? 0 : 1,
    }));
  };

  return (
    <div className="mx-auto min-h-screen bg-[#fcfcfd] font-sans p-4 md:p-8">
      <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">
        <div className="flex-1 space-y-12 overflow-hidden">
          <HabitHeader
            view={view}
            setView={setView}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddClick={() => setIsModalOpen(true)}
          />
          <HabitTable
            habits={habits}
            completionData={completionData}
            view={view}
            onToggle={toggleHabit}
            selectedDate={selectedDate}
          />
        </div>
        <div className="w-full lg:w-80 space-y-10">
          <HabitActions
            habits={habits}
            completionData={completionData}
            onToggleToday={(id: number, time?: string) =>
              toggleHabit(id, new Date(), time)
            }
          />
          <div className="p-8 bg-gray-900 rounded-[3rem] text-white shadow-3xl shadow-gray-200 relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
                Efficiency
              </h4>
              <p className="text-4xl font-black tracking-tighter">
                92.4<span className="text-blue-500">%</span>
              </p>
              <div className="mt-8 flex items-end gap-1.5 h-12">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/10 rounded-t-lg group-hover:bg-blue-500/30 transition-all duration-500"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddHabitModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={(name, color, schedules) => {
            const newHabit = {
              id: Date.now(),
              name,
              iconType: "circle",
              color,
              goal: schedules.length > 0 ? schedules.length : 1,
              createdAt: new Date(),
              schedules,
            };
            setHabits([...habits, newHabit]);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
