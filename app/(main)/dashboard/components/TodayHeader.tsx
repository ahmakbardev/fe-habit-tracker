"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

export default function TodayHeader() {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // update waktu tiap detik
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold text-slate-900 leading-snug">
          {/* Placeholder biar SSR stabil */}
          Loading...
        </h2>
        <p className="text-sm text-slate-500 mt-1">-- -- ----, --:--:--</p>
      </div>
    );
  }

  const formattedDate = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const formattedTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const weekday = now.toLocaleDateString("en-US", {
    weekday: "long",
  });

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2 leading-snug">
          Happy <br /> {weekday} <span className="text-3xl">👋</span>
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {formattedDate}, {formattedTime}
        </p>
      </div>

      <button className="w-full py-3 rounded-full bg-orange-400 text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-sm">
        <Plus size={18} />
        New Habits
      </button>

      <button className="w-full py-3 rounded-full bg-white border border-slate-300 text-slate-700 font-medium active:scale-95 transition">
        Browse Popular Habits
      </button>
    </div>
  );
}
