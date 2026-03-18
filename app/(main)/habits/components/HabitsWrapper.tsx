// app/(main)/habits/components/HabitsWrapper.tsx
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import HabitHeader from "./HabitHeader";
import HabitTable from "./HabitTable";
import HabitActions from "./HabitActions";
import AddHabitModal from "./AddHabitModal";
import ArchiveConfirmModal from "./ArchiveConfirmModal";
import { formatDateLocal, useMediaQuery } from "@/lib/utils";
import { Habit } from "./habit-types";
import { HabitService, ApiHabit, ApiHabitCompletion } from "../services/habit-service";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export default function HabitsWrapper() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [view, setView] = useState<"Week" | "Month">("Week");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [habitToArchive, setHabitToArchive] = useState<Habit | null>(null);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionData, setCompletionData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchHabits = useCallback(async () => {
    try {
      setLoading(true);
      const data = await HabitService.getAll();
      const mappedHabits: Habit[] = data.map((h) => ({
        id: h.id,
        name: h.name,
        iconType: h.icon_type,
        color: h.color,
        goal: h.goal,
        createdAt: h.created_at,
        schedules: h.schedules,
      }));
      setHabits(mappedHabits);
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletions = useCallback(async (start: Date, end: Date) => {
    try {
      const startStr = formatDateLocal(start);
      const endStr = formatDateLocal(end);
      const data = await HabitService.getCompletions(startStr, endStr);
      
      const newCompletionData: Record<string, number> = {};
      data.forEach((c) => {
        const key = `${c.habit_id}-${c.date}-${c.time_slot}`;
        newCompletionData[key] = c.status;
      });
      setCompletionData(newCompletionData);
    } catch (error) {
      console.error("Failed to fetch completions:", error);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  useEffect(() => {
    // Determine range based on view and selectedDate
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);
    
    if (view === "Week") {
      const day = start.getDay();
      const diff = start.getDate() - (day === 0 ? 6 : day - 1);
      start.setDate(diff);
      end.setDate(start.getDate() + 6);
    } else {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    }
    
    fetchCompletions(start, end);
  }, [view, selectedDate, fetchCompletions]);

  const toggleHabit = async (id: string, date: Date, time: string = "daily") => {
    if (isActionLoading) return;

    const dateStr = formatDateLocal(date);
    const dateKey = `${id}-${dateStr}-${time}`;
    
    // Optimistic update
    const previousStatus = completionData[dateKey] || 0;
    const newStatus = previousStatus === 1 ? 0 : 1;
    
    setCompletionData((prev) => ({
      ...prev,
      [dateKey]: newStatus,
    }));

    try {
      setIsActionLoading(true);
      await HabitService.toggle(id, dateStr, time);
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      // Rollback on error
      setCompletionData((prev) => ({
        ...prev,
        [dateKey]: previousStatus,
      }));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    if (isActionLoading) return;
    const habit = habits.find((h) => h.id === id);
    if (habit) {
      setHabitToArchive(habit);
    }
  };

  const confirmArchive = async () => {
    if (!habitToArchive || isActionLoading) return;
    
    try {
      setIsActionLoading(true);
      await HabitService.delete(habitToArchive.id);
      setHabits((prev) => prev.filter((h) => h.id !== habitToArchive.id));
      setHabitToArchive(null);
    } catch (error) {
      console.error("Failed to archive habit:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddHabit = async (name: string, color: string, schedules: string[]) => {
    if (isActionLoading) return;
    try {
      setIsActionLoading(true);
      const newApiHabit = await HabitService.create({
        name,
        color,
        schedules,
        icon_type: "circle", // default icon for now
        goal: schedules.length > 0 ? schedules.length : 1,
      });
      
      const newHabit: Habit = {
        id: newApiHabit.id,
        name: newApiHabit.name,
        iconType: newApiHabit.icon_type,
        color: newApiHabit.color,
        goal: newApiHabit.goal,
        createdAt: newApiHabit.created_at,
        schedules: newApiHabit.schedules,
      };
      
      setHabits((prev) => [...prev, newHabit]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create habit:", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading && habits.length === 0) {
    return (
      <div className="mx-auto min-h-screen bg-[#fcfcfd] p-4 md:p-8 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-20">
          <div className="flex-1 space-y-12">
            {/* Header Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-24 bg-slate-100 rounded-full" />
              <div className="flex justify-between items-end">
                <div className="h-12 w-64 bg-slate-200/60 rounded-3xl" />
                <div className="h-12 w-32 bg-slate-100 rounded-2xl" />
              </div>
            </div>
            {/* Table Skeleton */}
            <div className="space-y-6">
              <div className="h-80 bg-white rounded-[3rem] border border-slate-100 shadow-sm" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm" />
                ))}
              </div>
            </div>
          </div>
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-80 space-y-10">
            <div className="h-[400px] bg-white rounded-[3rem] border border-slate-100 shadow-sm" />
            <div className="h-56 bg-slate-900 rounded-[3rem]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen bg-[#fcfcfd] font-sans p-4 md:p-8 relative">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-20">
        <div className="flex-1 space-y-8 md:space-y-12 overflow-hidden">
          <HabitHeader
            view={view}
            setView={setView}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onAddClick={() => setIsModalOpen(true)}
            habits={habits}
            completionData={completionData}
          />
          <HabitTable
            habits={habits}
            completionData={completionData}
            view={view}
            onToggle={toggleHabit}
            onDelete={handleDeleteHabit}
            selectedDate={selectedDate}
          />
        </div>
        
        <div className="w-full lg:w-80 space-y-10">
          {!isMobile && (
            <HabitActions
              habits={habits}
              completionData={completionData}
              onToggleToday={(id: string, time?: string) =>
                toggleHabit(id, new Date(), time)
              }
            />
          )}
          
          <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-3xl shadow-blue-900/20 relative overflow-hidden group border border-white/5">
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">
                Today&apos;s Momentum
              </h4>
              
              {(() => {
                const dateStr = formatDateLocal(new Date());
                let totalTasks = 0;
                let completedTasks = 0;

                habits.forEach(h => {
                  if (h.schedules && h.schedules.length > 0) {
                    totalTasks += h.schedules.length;
                    h.schedules.forEach(t => {
                      if (completionData[`${h.id}-${dateStr}-${t}`] === 1) completedTasks++;
                    });
                  } else {
                    totalTasks += 1;
                    if (completionData[`${h.id}-${dateStr}-daily`] === 1) completedTasks++;
                  }
                });

                const remaining = totalTasks - completedTasks;
                const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-black tracking-tighter">
                        {percentage}<span className="text-blue-500 text-2xl">%</span>
                      </p>
                    </div>
                    
                    <p className="text-slate-400 text-xs font-bold mt-4 leading-relaxed">
                      {remaining > 0 
                        ? `You have ${remaining} more slots to check-in today. Keep it up!`
                        : "Amazing! You've completed all your habits for today. 🚀"}
                    </p>

                    <div className="mt-8 relative h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="absolute inset-y-0 left-0 bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                      />
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all duration-700" />
          </div>
        </div>
      </div>

      {isMobile && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-28 right-6 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center z-50 border-4 border-white"
        >
          <Plus size={28} />
        </motion.button>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <AddHabitModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddHabit}
            isLoading={isActionLoading}
          />
        )}
      </AnimatePresence>

      <ArchiveConfirmModal
        isOpen={!!habitToArchive}
        onClose={() => setHabitToArchive(null)}
        onConfirm={confirmArchive}
        habitName={habitToArchive?.name || ""}
        isLoading={isActionLoading}
      />
    </div>
  );
}
