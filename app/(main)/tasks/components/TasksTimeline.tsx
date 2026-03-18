"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { TaskItem, KanbanColumn } from "./task-types";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon,
  List
} from "lucide-react";
import clsx from "clsx";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addWeeks, 
  subWeeks, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  subDays,
  isSameMonth,
  getHours,
  getMinutes,
  differenceInMinutes,
  isWithinInterval,
  max,
  min,
  startOfDay,
  endOfDay
} from "date-fns";

type ViewMode = "day" | "week" | "month" | "schedule";

type TasksTimelineProps = {
  columns: KanbanColumn[];
  tasks: TaskItem[];
  onTaskClick?: (task: TaskItem) => void;
};

const priorityConfig = {
  low: "bg-blue-500",
  medium: "bg-orange-500",
  high: "bg-red-500",
};

export default function TasksTimeline({ columns, tasks, onTaskClick }: TasksTimelineProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper for safe date parsing
  const parseTaskDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr.replace(" ", "T"));
  };

  // --- Hour Slots for Day View ---
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  // --- Date Range Calculation ---
  const days = useMemo(() => {
    if (viewMode === "day") return [currentDate];
    
    let start, end;
    switch (viewMode) {
      case "week":
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case "month":
      default:
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
    }
    return eachDayOfInterval({ start, end });
  }, [currentDate, viewMode]);

  // --- Auto Scroll to Today/Now ---
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (viewMode === "day") {
        const now = new Date();
        if (isSameDay(currentDate, now)) {
          const currentHour = now.getHours();
          scrollContainerRef.current.scrollLeft = currentHour * 80 - 100; // 80px is hour width
        }
      } else {
        const todayIdx = days.findIndex((d: Date) => isToday(d));
        if (todayIdx !== -1) {
          const colWidth = viewMode === "month" ? 48 : 120;
          scrollContainerRef.current.scrollLeft = todayIdx * colWidth - 150;
        }
      }
    }
  }, [days, viewMode, currentDate]);

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handlePrev = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  // --- Layout Helpers ---
  const getHeaderTitle = () => {
    if (viewMode === "day") return format(currentDate, "MMMM d, yyyy");
    if (viewMode === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (isSameMonth(start, end)) return format(start, "MMMM yyyy");
      return `${format(start, "MMM")} - ${format(end, "MMM yyyy")}`;
    }
    return format(currentDate, "MMMM yyyy");
  };

  const getColWidth = () => {
    if (viewMode === "day") return "w-20"; // 80px
    if (viewMode === "week") return "w-[120px]";
    return "w-12"; // 48px
  };

  const getColWidthPx = () => {
    if (viewMode === "day") return 80;
    if (viewMode === "week") return 120;
    return 48;
  };

  // --- Render Controls ---
  function renderControls() {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
           <h3 className="text-lg font-bold text-slate-800 w-52 truncate">
             {getHeaderTitle()}
           </h3>
           <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
              <button onClick={handlePrev} className="p-1.5 hover:bg-slate-50 rounded-md transition text-slate-500">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-[10px] font-bold uppercase text-slate-600 hover:bg-slate-50 rounded-md transition border-x border-slate-100">
                Today
              </button>
              <button onClick={handleNext} className="p-1.5 hover:bg-slate-50 rounded-md transition text-slate-500">
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
        
        <div className="flex items-center bg-slate-200/50 p-1 rounded-xl">
           {[
             { id: "day", label: "Day" },
             { id: "week", label: "Week" },
             { id: "month", label: "Month" },
             { id: "schedule", label: "Schedule" }
           ].map(opt => (
             <button
               key={opt.id}
               onClick={() => setViewMode(opt.id as ViewMode)}
               className={clsx(
                 "px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                 viewMode === opt.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
               )}
             >
               {opt.label}
             </button>
           ))}
        </div>
      </div>
    );
  }

  // --- Main Render Logic ---
  if (viewMode === "schedule") {
    const sortedTasks = [...tasks].sort((a, b) => {
      const startA = parseTaskDate(a.startDate)?.getTime() || 0;
      const startB = parseTaskDate(b.startDate)?.getTime() || 0;
      return startA - startB;
    });

    return (
      <div className="flex-1 p-6 bg-slate-50/50 flex flex-col">
        {renderControls()}
        <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-slate-100 shadow-sm p-6 space-y-8 max-h-[500px]">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
               <List className="w-12 h-12 mb-4 opacity-10" />
               <p className="text-sm">No tasks in your schedule.</p>
            </div>
          ) : (
            sortedTasks.map((task: TaskItem) => (
              <div 
                key={task.id} 
                onClick={() => onTaskClick?.(task)}
                className="flex gap-4 group cursor-pointer"
              >
                <div className="w-32 flex-shrink-0 pt-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">
                     {task.startDate ? format(parseTaskDate(task.startDate)!, "EEE, MMM d") : "No Date"}
                   </p>
                   <p className="text-[9px] text-slate-300">
                     {task.startDate?.split(" ")[1]} - {task.dueDate?.split(" ")[1]}
                   </p>
                </div>
                <div className="flex-1 pb-4 border-b border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={clsx("w-2.5 h-2.5 rounded-full", priorityConfig[task.priority])} />
                      <p className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{task.title}</p>
                   </div>
                   <span className="text-[10px] font-bold text-slate-300 uppercase">{columns.find(c => c.id === task.status)?.title}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-slate-50/50 overflow-hidden flex flex-col">
      {renderControls()}

      <div className="flex flex-col w-full max-w-full max-h-[500px] max-md:mb-28 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex flex-1 overflow-hidden">
          
          {/* Fixed Task List Sidebar */}
          <div className="w-64 border-r border-slate-100 flex flex-col flex-shrink-0 bg-white z-10 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.05)]">
            <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Title</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 scrollbar-hide">
              {tasks.map((task: TaskItem) => (
                <div 
                  key={task.id} 
                  onClick={() => onTaskClick?.(task)}
                  className="h-14 px-4 flex items-center group cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-600">
                    {task.title}
                  </p>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="p-8 text-center text-[10px] text-slate-400 italic">No tasks.</div>
              )}
            </div>
          </div>

          {/* Scrollable Timeline Grid */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-auto relative scroll-smooth"
          >
            <div className="inline-flex flex-col min-w-full">
              {/* Timeline Header */}
              <div className="h-12 border-b border-slate-100 flex bg-slate-50/50 sticky top-0 z-20">
                {viewMode === "day" ? (
                  hours.map(hour => (
                    <div key={hour} className="w-20 h-full flex flex-col items-center justify-center flex-shrink-0 border-r border-slate-100/50">
                       <span className="text-[9px] font-bold text-slate-400 uppercase">{hour.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))
                ) : (
                  days.map((day: Date) => (
                    <div 
                      key={day.toISOString()} 
                      className={clsx(
                        "h-full flex flex-col items-center justify-center flex-shrink-0 border-r border-slate-100/50",
                        getColWidth(),
                        isToday(day) && "bg-blue-50/50"
                      )}
                    >
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{format(day, "eee")}</span>
                      <span className={clsx("text-xs font-bold", isToday(day) ? "text-blue-600" : "text-slate-600")}>
                        {format(day, "d")}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Rows Grid */}
              <div className="relative">
                {tasks.map((task: TaskItem) => {
                  const start = parseTaskDate(task.startDate);
                  const end = parseTaskDate(task.dueDate);
                  
                  if (!start || !end) return <div key={task.id} className="h-14 border-b border-slate-50" />;

                  // Visibility Logic
                  let isVisible = false;
                  if (viewMode === "day") {
                    isVisible = isWithinInterval(startOfDay(currentDate), { 
                      start: startOfDay(start), 
                      end: startOfDay(end) 
                    });
                  } else {
                    const rangeStart = startOfDay(days[0]);
                    const rangeEnd = endOfDay(days[days.length - 1]);
                    isVisible = (start <= rangeEnd && end >= rangeStart);
                  }

                  // Position & Width Calculation
                  let left = 0;
                  let width = 0;

                  if (isVisible) {
                    if (viewMode === "day") {
                      const dayStart = startOfDay(currentDate);
                      const dayEnd = endOfDay(currentDate);
                      const effectiveStart = max([start, dayStart]);
                      const effectiveEnd = min([end, dayEnd]);
                      
                      const startOffset = differenceInMinutes(effectiveStart, dayStart);
                      const duration = differenceInMinutes(effectiveEnd, effectiveStart);
                      
                      left = (startOffset / 60) * 80;
                      width = Math.max((duration / 60) * 80, 4); // Min width for visibility
                    } else {
                      const rangeStart = startOfDay(days[0]);
                      const rangeEnd = endOfDay(days[days.length - 1]);
                      const effectiveStart = max([start, rangeStart]);
                      const effectiveEnd = min([end, rangeEnd]);

                      const startDayOffset = Math.floor(differenceInMinutes(startOfDay(effectiveStart), rangeStart) / (24 * 60));
                      const totalDaysSpan = Math.max(1, Math.ceil(differenceInMinutes(endOfDay(effectiveEnd), startOfDay(effectiveStart)) / (24 * 60)));
                      
                      const colWidth = getColWidthPx();
                      left = startDayOffset * colWidth;
                      width = totalDaysSpan * colWidth;
                    }
                  }

                  return (
                    <div key={task.id} className="h-14 flex border-b border-slate-50 relative group">
                      {/* Grid Background Lines */}
                      {viewMode === "day" ? (
                        hours.map(h => <div key={h} className="w-20 h-full flex-shrink-0 border-r border-slate-50/50" />)
                      ) : (
                        days.map((day: Date) => (
                          <div key={day.toISOString()} className={clsx("h-full flex-shrink-0 border-r border-slate-50/50", getColWidth(), isToday(day) && "bg-blue-50/10")} />
                        ))
                      )}

                      {/* Task Pill (Bar) */}
                      {isVisible && (
                        <div 
                          className="absolute h-full flex items-center px-1 z-10"
                          style={{
                            left: `${left}px`,
                            width: `${width}px`
                          }}
                        >
                          <div 
                            className={clsx(
                              "h-8 rounded-full shadow-sm flex items-center px-3 gap-2 transition-all group-hover:shadow-md cursor-pointer border border-white/20",
                              priorityConfig[task.priority],
                              "w-full min-w-[32px]"
                            )} 
                            onClick={() => onTaskClick?.(task)}
                          >
                            <CalendarIcon className="w-3.5 h-3.5 text-white/80 shrink-0" />
                            <span className="text-[10px] font-bold text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Today/Now Indicator Line */}
                {viewMode === "day" && isSameDay(currentDate, new Date()) && (
                  <div 
                    className="absolute top-0 bottom-0 pointer-events-none z-20 border-l-2 border-red-400 border-dashed"
                    style={{ left: `${(getHours(new Date()) + getMinutes(new Date())/60) * 80}px` }}
                  >
                     <div className="w-2 h-2 rounded-full bg-red-400 -ml-[5px] mt-[46px]" />
                  </div>
                )}
                
                {(viewMode === "month" || viewMode === "week") && days.some((d: Date) => isToday(d)) && (
                  <div 
                    className="absolute top-0 bottom-0 pointer-events-none z-0 border-l-2 border-blue-400 border-dashed"
                    style={{ left: `${days.findIndex((d: Date) => isToday(d)) * getColWidthPx() + (getColWidthPx() / 2)}px` }}
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <p className="mt-4 text-[10px] text-slate-400 text-center font-medium italic">
        {viewMode === "day" ? "Day view with precise start/end tracking." : `Viewing in ${viewMode} mode.`}
      </p>
    </div>
  );
}
