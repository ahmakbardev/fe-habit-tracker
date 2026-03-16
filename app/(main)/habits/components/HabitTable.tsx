// app/(main)/habits/components/HabitTable.tsx
"use client";
import React, { useState } from "react";
import { X, Circle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "./habit-types";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
  view: "Week" | "Month";
  onToggle: (id: number, date: Date, time?: string) => void;
  selectedDate: Date;
};

export default function HabitTable({
  habits,
  completionData,
  view,
  onToggle,
  selectedDate,
}: Props) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const today = new Date();

  // Logika mendapatkan 7 hari dalam minggu (Selalu mulai dari Senin)
  const getDaysInSelectedWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Jika Minggu (0), ubah ke 7 untuk memudahkan kalkulasi Senin (1)
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const result = new Date(monday);
      result.setDate(monday.getDate() + i);
      return result;
    });
  };

  const weekDaysDates = getDaysInSelectedWeek(selectedDate);

  const getDayProgress = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const activeHabits = habits.filter(
      (h: Habit) =>
        new Date(h.createdAt).setHours(0, 0, 0, 0) <= date.setHours(0, 0, 0, 0)
    );
    if (activeHabits.length === 0) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    activeHabits.forEach((h: Habit) => {
      if (h.schedules && h.schedules.length > 0) {
        totalTasks += h.schedules.length;
        h.schedules.forEach((time: string) => {
          if (completionData[`${h.id}-${dateStr}-${time}`] === 1)
            completedTasks++;
        });
      } else {
        totalTasks += 1;
        if (completionData[`${h.id}-${dateStr}-daily`] === 1) completedTasks++;
      }
    });

    return (completedTasks / totalTasks) * 100;
  };

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells = [
    ...Array.from({ length: firstDayIndex === 0 ? 6 : firstDayIndex - 1 }, (_, i) => ({
      day: prevMonthDays - ((firstDayIndex === 0 ? 6 : firstDayIndex - 1) - 1 - i),
      type: "prev",
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      type: "current",
    })),
  ];
  while (calendarCells.length < 42)
    calendarCells.push({
      day: calendarCells.length - (calendarCells.length - (calendarCells.length % 7)), // Dummy logic for trailing
      type: "next",
    });

  // Re-fill trailing days properly
  const fillTrailing = 42 - calendarCells.length;
  for(let i=1; i<=fillTrailing; i++) {
    calendarCells.push({ day: i, type: "next" });
  }

  if (view === "Week") {
    const DAYS_NAME = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className="bg-white p-4 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
        <table className="w-full border-separate border-spacing-x-2 border-spacing-y-2 min-w-[700px]">
          <thead>
            <tr>
              <th className="w-48 px-4"></th>
              {weekDaysDates.map((date, i) => {
                const isRealToday = date.toDateString() === today.toDateString();
                return (
                  <th
                    key={i}
                    className={`text-[10px] font-black pb-4 uppercase tracking-widest transition-colors ${
                      isRealToday ? "text-blue-600" : "text-gray-400"
                    }`}
                  >
                    {DAYS_NAME[i]}
                    <div className="text-[12px] mt-1">{date.getDate()}</div>
                    {isRealToday && (
                      <div className="mt-1 h-1 w-1 bg-blue-600 rounded-full mx-auto" />
                    )}
                  </th>
                );
              })}
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {habits.map((h: Habit) => {
              const isPeriodic = h.schedules && h.schedules.length > 0;

              return (
                <React.Fragment key={h.id}>
                  <tr className="group">
                    <td className="flex items-center gap-3 py-3 px-4 sticky left-0 bg-white z-10">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          h.color
                        } bg-opacity-10 ${h.color.replace("bg-", "text-")}`}
                      >
                        {h.iconType === "x" ? (
                          <X size={14} />
                        ) : (
                          <Circle size={6} fill="currentColor" />
                        )}
                      </div>
                      <span className="font-bold text-gray-800 text-sm whitespace-nowrap">
                        {h.name}
                      </span>
                    </td>
                    {weekDaysDates.map((date, i) => {
                      const dateStr = formatDateLocal(date);
                      let isFullDone = false;
                      if (isPeriodic) {
                        isFullDone = h.schedules.every(
                          (t: string) =>
                            completionData[`${h.id}-${dateStr}-${t}`] === 1
                        );
                      } else {
                        isFullDone =
                          completionData[`${h.id}-${dateStr}-daily`] === 1;
                      }

                      const isFuture = date > today;
                      const isCreated =
                        new Date(h.createdAt).setHours(0, 0, 0, 0) <=
                        date.setHours(0, 0, 0, 0);

                      return (
                        <td
                          key={i}
                          className={`text-center rounded-2xl transition-all ${
                            date.toDateString() === today.toDateString()
                              ? "bg-blue-50/20"
                              : ""
                          }`}
                        >
                          <button
                            disabled={isFuture || !isCreated || isPeriodic}
                            onClick={() => onToggle(h.id, date, "daily")}
                            className={`w-10 h-10 rounded-2xl transition-all duration-500 border-2 border-transparent ${
                              isFullDone
                                ? h.color
                                : "bg-gray-50 hover:border-gray-200"
                            } ${
                              isFuture || !isCreated
                                ? "opacity-20 cursor-not-allowed"
                                : ""
                            } ${isPeriodic ? "cursor-default opacity-90" : ""}`}
                          >
                            {isPeriodic && isFullDone && (
                              <CheckCircle2
                                size={16}
                                className="text-white mx-auto"
                              />
                            )}
                          </button>
                        </td>
                      );
                    })}
                    <td className="text-right text-xs font-black text-gray-300 px-4">
                      {isPeriodic ? h.schedules.length + " slots" : "1 slot"}
                    </td>
                  </tr>

                  {isPeriodic &&
                    h.schedules.map((time: string) => (
                      <tr
                        key={`${h.id}-${time}`}
                        className="opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <td className="py-1 px-4 pl-12 sticky left-0 bg-white z-10">
                          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Clock size={10} />
                            {time}
                          </div>
                        </td>
                        {weekDaysDates.map((date, i) => {
                          const dateStr = formatDateLocal(date);
                          const isDone =
                            completionData[`${h.id}-${dateStr}-${time}`] === 1;
                          const isFuture = date > today;

                          return (
                            <td key={i} className="text-center py-1">
                              <button
                                disabled={isFuture}
                                onClick={() => onToggle(h.id, date, time)}
                                className={`w-6 h-6 rounded-lg transition-all duration-300 border ${
                                  isDone
                                    ? h.color + " border-transparent"
                                    : "bg-gray-50 border-gray-100 hover:border-gray-300"
                                } ${
                                  isFuture
                                    ? "opacity-20 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {isDone && (
                                  <CheckCircle2
                                    size={12}
                                    className="text-white mx-auto"
                                  />
                                )}
                              </button>
                            </td>
                          );
                        })}
                        <td></td>
                      </tr>
                    ))}
                  <tr className="h-2">
                    <td colSpan={10}></td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm overflow-visible">
      <div className="grid grid-cols-7 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, weekIdx) => {
          const startIdx = weekIdx * 7;
          const weekDays = calendarCells.slice(startIdx, startIdx + 7);
          const hasToday = weekDays.some(
            (c) =>
              c.type === "current" &&
              c.day === today.getDate() &&
              currentMonth === today.getMonth()
          );
          return (
            <div
              key={weekIdx}
              className={`grid grid-cols-7 relative py-1 rounded-[2rem] transition-all duration-500 ${
                hasToday
                  ? "bg-blue-50/50 border border-blue-100/50"
                  : "border border-transparent"
              }`}
            >
              {weekDays.map((cell, idx) => {
                const cellDate = cell.type === "current" 
                  ? new Date(currentYear, currentMonth, cell.day)
                  : cell.type === "prev"
                  ? new Date(currentYear, currentMonth - 1, cell.day)
                  : new Date(currentYear, currentMonth + 1, cell.day);

                const progress = getDayProgress(cellDate);
                const isFull = progress === 100;
                const activeToday = cell.type === "current" && cell.day === today.getDate() && currentMonth === today.getMonth();
                const isDimmed = cell.type !== "current";

                return (
                  <div
                    key={idx}
                    className={`relative flex flex-col items-center justify-center py-2 ${
                      isDimmed ? "opacity-20 grayscale pointer-events-none" : ""
                    }`}
                    onMouseEnter={() => !isDimmed && setHoveredDay(cell.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <motion.div
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center p-[3.5px] relative"
                      initial={false}
                      animate={{
                        background: `conic-gradient(${
                          isFull ? "#10b981" : "#3b82f6"
                        } ${progress}%, #f1f5f9 0%)`,
                        boxShadow: activeToday
                          ? "0 0 0 4px rgba(219, 234, 254, 1)"
                          : "none",
                      }}
                      transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                    >
                      <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner relative z-10">
                        <span
                          className={`text-xs font-black ${
                            activeToday
                              ? "text-blue-600 underline underline-offset-4 decoration-2"
                              : "text-gray-800"
                          }`}
                        >
                          {cell.day}
                        </span>
                      </div>
                    </motion.div>
                    <AnimatePresence>
                      {!isDimmed && hoveredDay === cell.day && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute bottom-[110%] z-[100] w-56 bg-gray-900 text-white p-5 rounded-[2.2rem] shadow-2xl pointer-events-none"
                        >
                          <p className="text-[9px] font-black text-gray-500 tracking-widest mb-3 uppercase">
                            Status • {cell.day}{" "}
                            {new Intl.DateTimeFormat("en-US", {
                              month: "short",
                            }).format(selectedDate)}
                          </p>
                          <div className="space-y-3">
                            {habits.map((h: Habit) => {
                              const dateStr = formatDateLocal(cellDate);
                              const isPeriodic = h.schedules?.length > 0;
                              let doneCount = 0;
                              if (isPeriodic) {
                                h.schedules.forEach((t: string) => {
                                  if (completionData[`${h.id}-${dateStr}-${t}`] === 1) doneCount++;
                                });
                              } else if (completionData[`${h.id}-${dateStr}-daily`] === 1) {
                                doneCount = 1;
                              }
                              const isCreated = new Date(h.createdAt).setHours(0, 0, 0, 0) <= cellDate.setHours(0, 0, 0, 0);
                              if (!isCreated) return null;
                              return (
                                <div key={h.id} className="flex items-center justify-between text-[11px]">
                                  <span className={doneCount === h.goal ? "text-white font-bold" : "text-gray-600"}>{h.name}</span>
                                  <span className="font-black">{doneCount}/{h.goal}</span>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}