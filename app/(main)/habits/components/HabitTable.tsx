// app/(main)/habits/components/HabitTable.tsx
"use client";
import React, { useState, useEffect } from "react";
import { X, Circle, CheckCircle2, Clock, ChevronDown, ChevronUp, Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "./habit-types";
import clsx from "clsx";

import { useMediaQuery } from "@/lib/utils";

type Props = {
  habits: Habit[];
  completionData: Record<string, number>;
  view: "Week" | "Month";
  onToggle: (id: string, date: Date, time?: string) => void;
  onDelete?: (id: string) => void;
  selectedDate: Date;
};

export default function HabitTable({
  habits,
  completionData,
  view,
  onToggle,
  onDelete,
  selectedDate,
}: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const [expandedHabits, setExpandedHabits] = useState<Record<string, boolean>>({});
  
  // State khusus mobile untuk tracking hari yang sedang dilihat
  const [focusedDate, setFocusedDate] = useState(new Date());
  
  const today = new Date();

  const toggleExpand = (id: string) => {
    setExpandedHabits(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Sync focusedDate dengan selectedDate dari parent (HabitHeader)
  useEffect(() => {
    setFocusedDate(selectedDate);
  }, [selectedDate]);

  const getDaysInSelectedWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
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
  const DAYS_NAME = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDayProgress = (date: Date) => {
    const dateStr = formatDateLocal(date);
    const activeHabits = habits.filter(
      (h: Habit) =>
        new Date(h.createdAt).setHours(0, 0, 0, 0) <= date.getTime()
    );
    if (activeHabits.length === 0) return 0;

    let totalTasks = 0;
    let completedTasks = 0;

    activeHabits.forEach((h: Habit) => {
      if (h.schedules && h.schedules.length > 0) {
        totalTasks += h.schedules.length;
        h.schedules.forEach((time: string) => {
          if (completionData[`${h.id}-${dateStr}-${time}`] === 1) completedTasks++;
        });
      } else {
        totalTasks += 1;
        if (completionData[`${h.id}-${dateStr}-daily`] === 1) completedTasks++;
      }
    });

    return totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
  };

  // --- MOBILE VIEW: VERTICAL FOCUS (WEEK) ---
  if (isMobile && view === "Week") {
    return (
      <div className="space-y-8">
        {/* 1. Horizontal Date Strip */}
        <div className="flex justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-200/50 shadow-sm sticky top-0 z-30">
          {weekDaysDates.map((date, i) => {
            const isFocused = date.toDateString() === focusedDate.toDateString();
            const isRealToday = date.toDateString() === today.toDateString();
            const progress = getDayProgress(date);
            
            return (
              <button
                key={i}
                onClick={() => setFocusedDate(date)}
                className={clsx(
                  "flex flex-col items-center gap-2 px-3 py-2.5 rounded-2xl transition-all relative",
                  isFocused ? "bg-slate-900 text-white shadow-xl scale-105" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {DAYS_NAME[i].substring(0, 1)}
                </span>
                <span className="text-base font-black tracking-tighter">{date.getDate()}</span>
                {/* Progress Dot */}
                {progress > 0 && !isFocused && (
                  <div className={clsx(
                    "absolute -bottom-1.5 w-1 h-1 rounded-full",
                    progress === 100 ? "bg-green-500" : "bg-blue-500"
                  )} />
                )}
                {isRealToday && isFocused && (
                  <div className="absolute -top-1 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Focused Habit List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
             <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
               {focusedDate.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
             </h4>
          </div>
          
          {habits.length === 0 ? (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
              <p className="text-slate-400 text-sm font-bold">Start your journey by adding a habit.</p>
            </div>
          ) : (
            habits.map((h) => {
              const dateStr = formatDateLocal(focusedDate);
              const isPeriodic = h.schedules && h.schedules.length > 0;
              const isFuture = focusedDate.getTime() > new Date().setHours(23,59,59,999);
              const isCreated = new Date(h.createdAt).setHours(0, 0, 0, 0) <= focusedDate.getTime();
              
              if (!isCreated) return null;

              let doneCount = 0;
              if (isPeriodic) {
                doneCount = h.schedules.filter(t => completionData[`${h.id}-${dateStr}-${t}`] === 1).length;
              } else {
                doneCount = completionData[`${h.id}-${dateStr}-daily`] === 1 ? 1 : 0;
              }
              const isFullDone = doneCount === h.goal;

              return (
                <motion.div
                  key={h.id}
                  layout
                  className={clsx(
                    "bg-white p-5 rounded-[2.5rem] border transition-all shadow-sm",
                    isFullDone ? "border-green-100 bg-green-50/5" : "border-slate-200/50"
                  )}
                >
                  <div className="flex items-center gap-5">
                    {/* Icon */}
                    <div className={clsx(
                      "w-14 h-14 rounded-3xl flex items-center justify-center shrink-0 shadow-inner",
                      h.color, "bg-opacity-10", h.color.replace("bg-", "text-")
                    )}>
                      {h.iconType === "x" ? <X size={28} /> : <Circle size={12} fill="currentColor" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0" onClick={() => isPeriodic && toggleExpand(h.id)}>
                      <h3 className="font-bold text-slate-800 text-base tracking-tight truncate">{h.name}</h3>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[120px]">
                            <motion.div 
                              className={clsx("h-full transition-all duration-500 shadow-[0_0_8px_rgba(0,0,0,0.05)]", isFullDone ? "bg-green-500" : h.color.replace("bg-", "bg-"))}
                              initial={{ width: 0 }}
                              animate={{ width: `${(doneCount / h.goal) * 100}%` }}
                            />
                         </div>
                         <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                            {doneCount}/{h.goal}
                         </span>
                         <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(h.id);
                          }}
                          className="text-red-400 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Big Toggle Action */}
                    {!isPeriodic ? (
                      <button
                        disabled={isFuture}
                        onClick={() => onToggle(h.id, focusedDate, "daily")}
                        className={clsx(
                          "w-14 h-14 rounded-3xl flex items-center justify-center transition-all active:scale-90 shadow-lg",
                          isFullDone ? h.color : "bg-white border border-slate-100",
                          isFuture && "opacity-20 grayscale"
                        )}
                      >
                         <CheckCircle2 size={28} className={isFullDone ? "text-white" : "text-slate-100"} />
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleExpand(h.id)}
                        className="w-14 h-14 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 active:scale-95 border border-slate-100"
                      >
                        {expandedHabits[h.id] ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                      </button>
                    )}
                  </div>

                  {/* Sub-Schedules (Mobile) */}
                  <AnimatePresence>
                    {isPeriodic && expandedHabits[h.id] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-3"
                      >
                        {h.schedules.map((time) => {
                          const isDone = completionData[`${h.id}-${dateStr}-${time}`] === 1;
                          const isHex = h.color.startsWith("#");
                          
                          return (
                            <button
                              key={time}
                              disabled={isFuture}
                              onClick={() => onToggle(h.id, focusedDate, time)}
                              style={isDone && isHex ? { backgroundColor: h.color } : {}}
                              className={clsx(
                                "flex items-center justify-between px-4 py-4 rounded-2xl border transition-all active:scale-95 shadow-sm",
                                isDone 
                                  ? (isHex ? "" : h.color) + " border-transparent text-white shadow-md shadow-blue-900/10" 
                                  : isFuture 
                                    ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
                                    : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                              )}
                            >
                              <span className="text-xs font-black tracking-tight">{time}</span>
                              {isDone ? <CheckCircle2 size={16} /> : <Circle size={5} className="opacity-20" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // --- MOBILE VIEW: MONTH ---
  if (isMobile && view === "Month") {
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    return (
      <div className="space-y-6 pb-0">
        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon size={16} className="text-blue-500" />
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">
              Monthly Overview
            </h3>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-black text-slate-300">
                {d}
              </div>
            ))}
            {/* Simple Mobile Calendar Grid */}
            {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const progress = getDayProgress(date);
              const isToday = date.toDateString() === today.toDateString();
              
              return (
                <button
                  key={day}
                  onClick={() => {
                    setFocusedDate(date);
                  }}
                  className={clsx(
                    "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90",
                    isToday ? "ring-2 ring-blue-500 ring-offset-2" : "",
                    progress === 100 ? "bg-green-500 text-white" : 
                    progress > 50 ? "bg-blue-500 text-white" :
                    progress > 0 ? "bg-blue-100 text-blue-600" :
                    "bg-slate-50 text-slate-400"
                  )}
                >
                  <span className="text-[10px] font-black">{day}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Monthly Milestone Card - Replacing Consistency */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Monthly Milestone
              </h4>
           </div>
           {(() => {
              const currentMonth = selectedDate.getMonth();
              const currentYear = selectedDate.getFullYear();
              const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
              
              let totalCheckins = 0;
              habits.forEach(h => {
                for (let d = 1; d <= daysInMonth; d++) {
                  const date = new Date(currentYear, currentMonth, d);
                  const dateStr = formatDateLocal(date);
                  if (h.schedules && h.schedules.length > 0) {
                    h.schedules.forEach(t => {
                      if (completionData[`${h.id}-${dateStr}-${t}`] === 1) totalCheckins++;
                    });
                  } else {
                    if (completionData[`${h.id}-${dateStr}-daily`] === 1) totalCheckins++;
                  }
                }
              });

              return (
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative border border-white/5">
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Total Activity</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">{totalCheckins}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Check-ins this month</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-4 font-medium leading-relaxed">
                      You are building a strong foundation. Every check-in is a step towards your better self.
                    </p>
                  </div>
                  {/* Abstract decorative element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                </div>
              );
           })()}
        </div>
      </div>
    );
  }

  // --- DESKTOP VIEWS ---
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarCells: { day: number; type: "prev" | "current" | "next" }[] = [
    ...Array.from({ length: firstDayIndex === 0 ? 6 : (firstDayIndex - 1 < 0 ? 6 : firstDayIndex - 1) }, (_, i) => ({
      day: prevMonthDays - ((firstDayIndex === 0 ? 6 : (firstDayIndex - 1 < 0 ? 6 : firstDayIndex - 1)) - 1 - i),
      type: "prev" as const,
    })),
    ...Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      type: "current" as const,
    })),
  ];
  while (calendarCells.length < 42) {
    calendarCells.push({
      day: calendarCells.length - daysInMonth - (firstDayIndex === 0 ? 6 : (firstDayIndex - 1 < 0 ? 6 : firstDayIndex - 1)) + 1,
      type: "next" as const,
    });
  }

  if (view === "Week") {
    return (
      <div className="space-y-4">
        {/* --- REFINED STICKY HEADER --- */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 pb-3 pt-1">
          <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 items-center px-2">
            <div className="hidden md:block pl-2">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Habit List</span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekDaysDates.map((date, i) => {
                const isRealToday = date.toDateString() === today.toDateString();
                return (
                  <div key={i} className="flex flex-col items-center py-1">
                    <span className={clsx(
                      "text-[9px] font-bold uppercase tracking-wider mb-1",
                      isRealToday ? "text-black" : "text-slate-400"
                    )}>
                      {DAYS_NAME[i]}
                    </span>
                    <div className={clsx(
                      "text-sm font-semibold transition-all w-7 h-7 flex items-center justify-center rounded-lg",
                      isRealToday ? "bg-slate-900 text-white" : "text-slate-600"
                    )}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- CLEAN HABIT CARDS --- */}
        <div className="space-y-2.5">
          {habits.map((h: Habit) => {
            const isPeriodic = h.schedules && h.schedules.length > 0;
            const isExpanded = expandedHabits[h.id];

            return (
              <motion.div
                key={h.id}
                layout
                className="bg-white rounded-xl border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-slate-300 transition-colors overflow-hidden"
              >
                {/* CARD CONTENT */}
                <div className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 items-center p-3 md:p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={clsx(
                      "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                      h.color, "bg-opacity-10", h.color.replace("bg-", "text-")
                    )}>
                      {h.iconType === "x" ? <X size={16} /> : <Circle size={6} fill="currentColor" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-800 text-sm truncate tracking-tight">{h.name}</h3>
                      <div className="flex items-center gap-3">
                        {isPeriodic && (
                           <button 
                              onClick={() => toggleExpand(h.id)}
                              className="flex items-center gap-1 text-[9px] font-bold uppercase text-slate-400 hover:text-slate-900 transition-colors"
                           >
                              {h.schedules.length} Slots {isExpanded ? <ChevronUp size={8} /> : <ChevronDown size={8} />}
                           </button>
                        )}
                        <button 
                          onClick={() => onDelete?.(h.id)}
                          className="text-[9px] font-bold uppercase text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={10} /> Archive
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {weekDaysDates.map((date, i) => {
                      const dateStr = formatDateLocal(date);
                      let isFullDone = false;
                      if (isPeriodic) {
                        isFullDone = h.schedules.every(t => completionData[`${h.id}-${dateStr}-${t}`] === 1);
                      } else {
                        isFullDone = completionData[`${h.id}-${dateStr}-daily`] === 1;
                      }

                      const isFuture = date > today;
                      const isCreated = new Date(h.createdAt).setHours(0, 0, 0, 0) <= date.getTime();

                      return (
                        <div key={i} className="flex justify-center">
                          <button
                            disabled={isFuture || !isCreated || isPeriodic}
                            onClick={() => onToggle(h.id, date, "daily")}
                            className={clsx(
                              "w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all duration-200 relative",
                              isFullDone ? h.color : "bg-slate-50 border border-slate-100",
                              (isFuture || !isCreated) && "opacity-10 grayscale pointer-events-none",
                              isPeriodic && !isFullDone && "bg-slate-50/50"
                            )}
                          >
                            {isFullDone ? (
                              <CheckCircle2 size={14} className="text-white" />
                            ) : isPeriodic && (
                                <div className="text-[9px] font-bold text-slate-300">
                                   {h.schedules.filter(t => completionData[`${h.id}-${dateStr}-${t}`] === 1).length}
                                </div>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* SLOTS SECTION */}
                <AnimatePresence>
                  {isPeriodic && isExpanded && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
                      className="border-t border-slate-50 bg-slate-50/20"
                    >
                      <div className="p-3 md:p-4 space-y-2">
                        {h.schedules.map((time) => (
                          <div key={time} className="grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] gap-4 items-center">
                            <div className="flex items-center gap-2 pl-12">
                               <Clock size={10} className="text-slate-300" />
                               <span className="text-[10px] font-bold text-slate-400">{time}</span>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                              {weekDaysDates.map((date, i) => {
                                const dateStr = formatDateLocal(date);
                                const isDone = completionData[`${h.id}-${dateStr}-${time}`] === 1;
                                const isFuture = date > today;
                                const isHex = h.color.startsWith("#");

                                return (
                                  <div key={i} className="flex justify-center">
                                    <button
                                      disabled={isFuture}
                                      onClick={() => onToggle(h.id, date, time)}
                                      style={isDone && isHex ? { backgroundColor: h.color } : {}}
                                      className={clsx(
                                        "w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center transition-all",
                                        isDone 
                                          ? (isHex ? "" : h.color) + " border-transparent text-white shadow-sm" 
                                          : isFuture 
                                            ? "bg-slate-50 border-slate-100 opacity-20 pointer-events-none"
                                            : "bg-white border border-slate-100"
                                      )}
                                    >
                                      {isDone && <CheckCircle2 size={10} className="text-white" />}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- REFINED MONTH VIEW (DESKTOP) ---
  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60">
      <div className="grid grid-cols-7 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {d}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 6 }).map((_, weekIdx) => {
          const startIdx = weekIdx * 7;
          const weekDays = calendarCells.slice(startIdx, startIdx + 7);
          return (
            <div key={weekIdx} className="grid grid-cols-7 gap-1.5">
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
                    className={clsx(
                      "relative flex flex-col items-center justify-center aspect-square rounded-xl transition-all",
                      isDimmed && "opacity-5 grayscale pointer-events-none",
                      activeToday ? "bg-slate-50 ring-1 ring-slate-200" : "hover:bg-slate-50/50"
                    )}
                    onMouseEnter={() => !isDimmed && setHoveredDay(cell.day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    <div className="relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
                       {/* Subtle Progress Ring */}
                       <svg className="absolute inset-0 w-full h-full -rotate-90">
                          <circle cx="50%" cy="50%" r="45%" fill="none" stroke="#f1f5f9" strokeWidth="2" />
                          <circle 
                            cx="50%" cy="50%" r="45%" fill="none" 
                            stroke={isFull ? "#10b981" : "#3b82f6"} 
                            strokeWidth="2"
                            strokeDasharray="100"
                            strokeDashoffset={100 - progress}
                            className="transition-all duration-1000 ease-out"
                          />
                       </svg>
                       <span className={clsx("text-[10px] font-bold", activeToday ? "text-blue-600" : "text-slate-600")}>
                          {cell.day}
                       </span>
                    </div>

                    <AnimatePresence>
                      {!isDimmed && hoveredDay === cell.day && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                          className="absolute bottom-[110%] z-[100] w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl pointer-events-none border border-slate-800"
                        >
                          <p className="text-[9px] font-bold text-slate-500 mb-2 uppercase tracking-widest text-center">
                            {cell.day} {new Intl.DateTimeFormat("en-US", { month: "short" }).format(selectedDate)}
                          </p>
                          <div className="space-y-1.5">
                            {habits.map((h: Habit) => {
                              const dateStr = formatDateLocal(cellDate);
                              const isCreated = new Date(h.createdAt).setHours(0, 0, 0, 0) <= cellDate.getTime();
                              if (!isCreated) return null;
                              return (
                                <div key={h.id} className="flex items-center justify-between text-[10px]">
                                  <span className="text-slate-400 truncate pr-2">{h.name}</span>
                                  <div className={clsx("w-2 h-2 rounded-full", completionData[`${h.id}-${dateStr}-daily`] === 1 || h.schedules.every(t => completionData[`${h.id}-${dateStr}-${t}`] === 1) ? "bg-green-500" : "bg-slate-700")} />
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
