// app/(main)/habits/components/AddHabitModal.tsx
"use client";
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Zap,
  Clock,
  ChevronDown,
  Check,
  Settings2,
  Loader2,
} from "lucide-react";
import { useMediaQuery } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import TimePicker from "./TimePicker";

export default function AddHabitModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (name: string, color: string, schedules: string[]) => void;
  isLoading?: boolean;
}) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const [name, setName] = useState("");
  const [color, setColor] = useState("bg-blue-600");
  const [mode, setMode] = useState<"daily" | "periodic" | "custom">("daily");

  const [intervalVal, setIntervalVal] = useState(60);
  const [isIntervalOpen, setIsIntervalOpen] = useState(false);
  const [isCustomInterval, setIsCustomInterval] = useState(false);

  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [customTimes, setCustomTimes] = useState<string[]>(["08:00"]);

  const intervalOptions = [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
  ];

  const colors = [
    { name: "Blue", class: "bg-blue-600" },
    { name: "Pink", class: "bg-pink-500" },
    { name: "Purple", class: "bg-purple-500" },
    { name: "Cyan", class: "bg-cyan-400" },
    { name: "Orange", class: "bg-orange-400" },
    { name: "Emerald", class: "bg-emerald-500" },
  ];

  const handleAutoGenerate = () => {
    const times: string[] = [];
    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const current = new Date();
    current.setHours(startH, startM, 0);
    const end = new Date();
    end.setHours(endH, endM, 0);
    if (end < current) end.setDate(end.getDate() + 1);

    const safeInterval = intervalVal > 0 ? intervalVal : 1;
    while (current <= end) {
      times.push(current.toTimeString().substring(0, 5));
      current.setMinutes(current.getMinutes() + safeInterval);
    }
    setCustomTimes(times);
    setMode("custom");
  };

  if (!hasMounted) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[9999] md:p-4 overflow-hidden"
      onClick={onClose}
    >
      <motion.div 
        initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
        exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        drag={isMobile ? "y" : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.8 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150 || info.velocity.y > 500) {
            onClose();
          }
        }}
        onClick={(e) => e.stopPropagation()}
        className={clsx(
          "bg-white w-full shadow-2xl border border-white/20 overflow-y-auto",
          isMobile 
            ? "fixed bottom-0 rounded-t-[3rem] max-h-[92vh] p-6 pb-10" 
            : "max-w-lg rounded-[3rem] p-8"
        )}
      >
        {/* Mobile Handle */}
        {isMobile && (
          <div className="flex justify-center mb-6">
            <div className="w-12 h-1.5 bg-slate-200 rounded-full" onClick={onClose} />
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              New Habit
            </h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-2.5">
              Personalize your journey
            </p>
          </div>
          {!isMobile && (
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X size={24} className="text-slate-400" />
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div className="space-y-5">
            <input
              autoFocus
              className="w-full p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-slate-700 text-lg placeholder:text-slate-300 transition-all"
              placeholder="Habit name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.class}
                  onClick={() => setColor(c.class)}
                  className={clsx(
                    "flex-1 h-12 rounded-2xl transition-all",
                    c.class,
                    color === c.class
                      ? "ring-4 ring-offset-4 ring-slate-100 scale-105 shadow-lg"
                      : "opacity-40 hover:opacity-100"
                  )}
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 space-y-8">
            <div className="flex flex-col gap-4">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                Frequency Mode
              </label>
              <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
                {(["daily", "periodic", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={clsx(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      mode === m
                        ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                        : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {m === "daily"
                      ? "Once"
                      : m === "periodic"
                      ? "Auto"
                      : "Manual"}
                  </button>
                ))}
              </div>
            </div>

            {mode === "periodic" && (
              <div className="space-y-8 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Interval Config
                    </span>
                    <button
                      onClick={() => setIsCustomInterval(!isCustomInterval)}
                      className="text-blue-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                    >
                      <Settings2 size={12} />{" "}
                      {isCustomInterval ? "Presets" : "Custom"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {isCustomInterval ? (
                      <div className="relative">
                        <input
                          type="number"
                          placeholder="Min..."
                          value={intervalVal}
                          onChange={(e) =>
                            setIntervalVal(parseInt(e.target.value) || 0)
                          }
                          className="w-full p-4 bg-white rounded-xl border border-slate-100 text-sm font-bold outline-none focus:border-blue-500 pr-12 transition-all shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">
                          Min
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setIsIntervalOpen(!isIntervalOpen)}
                          className="w-full p-4 bg-white rounded-xl border border-slate-100 text-sm font-bold flex items-center justify-between hover:border-blue-200 transition-all shadow-sm"
                        >
                          Every{" "}
                          {intervalOptions.find(
                            (opt) => opt.value === intervalVal
                          )?.label || `${intervalVal}m`}
                          <ChevronDown
                            size={16}
                            className={clsx("transition-transform opacity-40", isIntervalOpen && "rotate-180")}
                          />
                        </button>
                        {isIntervalOpen && (
                          <div className="absolute bottom-full mb-3 left-0 w-full bg-white border border-slate-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            {intervalOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setIntervalVal(opt.value);
                                  setIsIntervalOpen(false);
                                }}
                                className="w-full p-4 text-left text-xs font-bold hover:bg-blue-50 flex items-center justify-between transition-colors"
                              >
                                <span
                                  className={
                                    intervalVal === opt.value
                                      ? "text-blue-600"
                                      : "text-slate-600"
                                  }
                                >
                                  Every {opt.label}
                                </span>
                                {intervalVal === opt.value && (
                                  <Check size={16} className="text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleAutoGenerate}
                      className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2.5 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      <Zap size={16} className="fill-current" /> Generate
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm items-end">
                  <TimePicker 
                    label="Start" 
                    value={startTime} 
                    onChange={setStartTime} 
                  />
                  <TimePicker 
                    label="End" 
                    value={endTime} 
                    onChange={setEndTime} 
                  />
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="space-y-5 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    {customTimes.length} Active Slots
                  </span>
                  <button
                    onClick={() => setCustomTimes([...customTimes, "12:00"])}
                    className="text-blue-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 hover:underline"
                  >
                    <Plus size={12} /> Add Time
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 p-1">
                  {customTimes.map((time, idx) => (
                    <div key={idx} className="group relative">
                      <TimePicker 
                        value={time} 
                        onChange={(newTime) => {
                          const newTimes = [...customTimes];
                          newTimes[idx] = newTime;
                          setCustomTimes(newTimes);
                        }} 
                      />
                      <button
                        onClick={() =>
                          setCustomTimes(
                            customTimes.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "daily" && (
              <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-5 animate-in fade-in">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                  <Clock size={28} />
                </div>
                <p className="text-xs font-bold text-blue-800 leading-relaxed">
                  One check-in slot per day. Perfect for general tasks like &quot;No Alcohol&quot; or &quot;Reading&quot;.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-6">
            <button
              onClick={onClose}
              className="flex-1 py-5 text-xs font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em]"
            >
              Cancel
            </button>
            <button
              disabled={!name || (mode !== "daily" && customTimes.length === 0) || isLoading}
              onClick={() =>
                onSubmit(name, color, mode === "daily" ? [] : customTimes)
              }
              className="flex-1 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-xs hover:bg-blue-700 transition shadow-2xl shadow-blue-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed active:scale-[0.98] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Confirm Habit"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
