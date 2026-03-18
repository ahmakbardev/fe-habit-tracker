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
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold text-slate-900 leading-snug">
            Loading...
          </h2>
          {/* Skeleton/Placeholder untuk Jam Kanan */}
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">--:--:--</p>
            <p className="text-sm text-slate-500">-- --- ----</p>
          </div>
        </div>
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
    <div className="flex flex-col gap-4">
      {/* Container Header: Flex Row untuk memisahkan Kiri (Sapaan) & Kanan (Waktu) */}
      <div className="flex justify-between items-end">
        {/* Kiri: Sapaan */}
        <h2 className="text-3xl font-bold text-slate-900 leading-snug">
          Happy <br /> {weekday} <span className="inline-block">👋</span>
        </h2>

        {/* Kanan: Waktu & Tanggal */}
        <div className="text-right flex flex-col justify-end">
          <p className="text-4xl font-bold text-slate-900 tracking-tight">
            {formattedTime}
          </p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-0.5">
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-2">
        <button className="w-full py-3 rounded-full bg-orange-400 text-white font-medium flex items-center justify-center gap-2 active:scale-95 transition shadow-sm hover:bg-orange-500">
          <Plus size={18} />
          New Habits
        </button>

        <button className="w-full py-3 rounded-full bg-white border border-slate-300 text-slate-700 font-medium active:scale-95 transition hover:bg-slate-50">
          Browse Popular Habits
        </button>
      </div>
    </div>
  );
}
