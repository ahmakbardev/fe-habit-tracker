// app/(main)/habits/components/TimePicker.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { Clock, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type Props = {
  value: string; // format "HH:mm"
  onChange: (value: string) => void;
  label?: string;
};

export default function TimePicker({ value, onChange, label }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value
  const [h, m] = value.split(":").map(Number);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ... 55

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateTime = (newH: number, newM: number) => {
    const formattedH = newH.toString().padStart(2, "0");
    const formattedM = newM.toString().padStart(2, "0");
    onChange(`${formattedH}:${formattedM}`);
  };

  return (
    <div className="relative flex-1" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-full p-4 bg-white rounded-2xl border transition-all flex items-center justify-between group shadow-sm",
          isOpen ? "border-blue-500 ring-4 ring-blue-500/5" : "border-slate-100 hover:border-slate-300"
        )}
      >
        <div className="flex items-center gap-3">
          <Clock size={16} className={clsx("transition-colors", isOpen ? "text-blue-500" : "text-slate-300")} />
          <span className="text-sm font-black text-slate-700 tracking-tight">
            {value}
          </span>
        </div>
        <ChevronDown size={16} className={clsx("transition-transform duration-300 opacity-30", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-0 w-full bg-white border border-slate-100 rounded-[2rem] shadow-2xl z-[100] p-4 flex gap-4 overflow-hidden min-w-[200px]"
          >
            {/* Hours */}
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-2">Hour</p>
              <div className="h-40 overflow-y-auto scrollbar-hide space-y-1 pr-1">
                {hours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => updateTime(hour, m)}
                    className={clsx(
                      "w-full py-2.5 rounded-xl text-xs font-bold transition-all",
                      h === hour ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {hour.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes */}
            <div className="flex-1 space-y-1 border-l border-slate-50 pl-4">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest text-center mb-2">Min</p>
              <div className="h-40 overflow-y-auto scrollbar-hide space-y-1 pr-1">
                {minutes.map((min) => (
                  <button
                    key={min}
                    onClick={() => updateTime(h, min)}
                    className={clsx(
                      "w-full py-2.5 rounded-xl text-xs font-bold transition-all",
                      m === min ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    {min.toString().padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
