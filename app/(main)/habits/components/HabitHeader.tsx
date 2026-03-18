// app/(main)/habits/components/HabitHeader.tsx
"use client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";
import { formatDateLocal } from "@/lib/utils";
import { Habit } from "./habit-types";

type Props = {
  view: "Week" | "Month";
  setView: (view: "Week" | "Month") => void;
  onAddClick: () => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  habits?: Habit[];
  completionData?: Record<string, number>;
};

export default function HabitHeader({
  view,
  setView,
  onAddClick,
  selectedDate,
  setSelectedDate,
  habits = [],
  completionData = {},
}: Props) {
  // 1. Helper untuk mendapatkan range Senin - Minggu dari selectedDate
  const getWeekRange = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    // Monday as start (1), Sunday as end (0)
    const diffToMonday = d.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(new Date(d).setDate(diffToMonday));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return { monday, sunday };
  };

  const { monday, sunday } = getWeekRange(selectedDate);

  // 2. Format Tampilan Tanggal Header sesuai referensi (Contoh: Dec 29 - Jan 4, 2026)
  const formatDateRange = () => {
    const startMonth = monday.toLocaleDateString("en-US", { month: "short" });
    const endMonth = sunday.toLocaleDateString("en-US", { month: "short" });
    const startDay = monday.getDate();
    const endDay = sunday.getDate();
    const year = sunday.getFullYear();

    // Jika dalam satu minggu bulannya sama
    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`;
    }
    // Jika lintas bulan (Contoh: Dec 29 - Jan 4)
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  };

  // 3. Logika Navigasi (Sync Week)
  const handleNavigation = (direction: number) => {
    const newDate = new Date(selectedDate);
    if (view === "Week") {
      // Geser tepat 7 hari untuk berpindah ke minggu berikutnya/sebelumnya
      newDate.setDate(selectedDate.getDate() + direction * 7);
    } else {
      // Mode Month: Pindah bulan dan ke tanggal 1
      newDate.setMonth(selectedDate.getMonth() + direction);
      newDate.setDate(1);
    }
    setSelectedDate(newDate);
  };

  // 4. Kalkulasi Progress Rata-rata Minggu Ini (Berdasarkan rentang Monday - Sunday)
  const calculateTotalProgress = () => {
    if (!habits || habits.length === 0) return 0;

    let totalPossible = 0;
    let totalDone = 0;

    habits.forEach((h: Habit) => {
      // Iterasi 7 hari dalam rentang minggu tersebut
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = formatDateLocal(d);

        // Validasi: Hanya hitung jika habit sudah dibuat pada/sebelum hari tersebut
        if (new Date(h.createdAt).setHours(0, 0, 0, 0) <= d.getTime()) {
          if (h.schedules && h.schedules.length > 0) {
            totalPossible += h.schedules.length;
            h.schedules.forEach((t: string) => {
              if (completionData[`${h.id}-${dateStr}-${t}`] === 1) totalDone++;
            });
          } else {
            totalPossible += 1;
            if (completionData[`${h.id}-${dateStr}-daily`] === 1) totalDone++;
          }
        }
      }
    });
    return totalPossible === 0
      ? 0
      : Math.round((totalDone / totalPossible) * 100);
  };

  const progress = calculateTotalProgress();

  return (
    <div className="space-y-6">
      {/* Baris Atas: Tab Switcher & Add Button */}
      <div className="flex items-center justify-between">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          {(["Week", "Month"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                view === tab
                  ? "bg-white shadow-sm font-medium text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
          {/* Tab Placeholder untuk visual referensi */}
          {["Year", "All Time"].map((tab) => (
            <button
              key={tab}
              className="px-4 py-2 rounded-lg text-sm text-gray-300 cursor-not-allowed"
              disabled
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={onAddClick}
          className="bg-white border border-blue-100 text-blue-600 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm hover:bg-blue-50 transition active:scale-95"
        >
          <Plus size={18} /> Add Habit
        </button>
      </div>

      {/* Baris Tengah: Navigasi & Label Tanggal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-1">
            <button
              onClick={() => handleNavigation(-1)}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => handleNavigation(1)}
              className="p-1.5 border rounded-full hover:bg-gray-50 transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-700 tracking-tight">
            {view === "Week"
              ? formatDateRange()
              : `${selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}`}
          </h2>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            className={`p-1.5 transition-all ${
              view === "Week"
                ? "bg-white shadow-sm rounded-md text-gray-700"
                : "text-gray-400"
            }`}
          >
            <List size={18} />
          </button>
          <button
            className={`p-1.5 transition-all ${
              view === "Month"
                ? "bg-white shadow-sm rounded-md text-gray-700"
                : "text-gray-400"
            }`}
          >
            <LayoutGrid size={18} />
          </button>
        </div>
      </div>

      {/* Baris Bawah: Progress Bar & Info Persentase (Sesuai Referensi) */}
      <div className="space-y-2">
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-600 font-medium">
            {progress > 0
              ? `↑ Up ${progress}% achieved`
              : `Start tracking to see progress`}
          </span>
          <span className="text-gray-500 font-semibold">
            {progress}% achieved
          </span>
        </div>
      </div>
    </div>
  );
}
