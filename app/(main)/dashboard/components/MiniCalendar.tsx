"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function MiniCalendar() {
  const [today] = useState(new Date()); // Wrap di state agar konsisten

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  );

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"month" | "year">("month");

  // --- STATE UNTUK DIALOG ---
  const [showDialog, setShowDialog] = useState(false);
  const [activeDialogDate, setActiveDialogDate] = useState<Date | null>(null);

  // contoh streak
  const streakDays = [5, 9, 10, 16, 17, 20, 22, 28, 30];

  const monthName = MONTHS[currentMonth];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // -------------------------
  // Generate FULL 6x7 Calendar
  // -------------------------

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0=Sun
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
  const totalCells = 42;

  const leadingDays = Array.from({ length: firstDayIndex }, (_, i) => ({
    day: prevMonthDays - (firstDayIndex - 1 - i),
    type: "prev",
  }));

  const currentDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    type: "current",
  }));

  const trailingCount = totalCells - (leadingDays.length + currentDays.length);

  const trailingDays = Array.from({ length: trailingCount }, (_, i) => ({
    day: i + 1,
    type: "next",
  }));

  const calendarDays = [...leadingDays, ...currentDays, ...trailingDays];

  // -------------------------
  // PERBAIKAN LOGIC DI SINI
  // -------------------------

  function prevMonth() {
    // Cek langsung state currentMonth, jangan di dalam callback updater
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    // Cek langsung state currentMonth
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }

  // --- HANDLER KLIK TANGGAL ---
  const handleDateClick = (day: number, type: string) => {
    // 1. Hitung Tahun dan Bulan TARGET (bukan current)
    let targetMonth = currentMonth;
    let targetYear = currentYear;

    if (type === "prev") {
      if (currentMonth === 0) {
        targetMonth = 11;
        targetYear = currentYear - 1;
      } else {
        targetMonth = currentMonth - 1;
      }
      prevMonth(); // Pindah view
    } else if (type === "next") {
      if (currentMonth === 11) {
        targetMonth = 0;
        targetYear = currentYear + 1;
      } else {
        targetMonth = currentMonth + 1;
      }
      nextMonth(); // Pindah view
    }

    // 2. Set Selected Visual
    setSelectedDate(day);

    // 3. Set Data Dialog & Buka Dialog
    const fullDate = new Date(targetYear, targetMonth, day);
    setActiveDialogDate(fullDate);
    setShowDialog(true);
  };

  return (
    <>
      <div className="flex flex-col gap-3 select-none py-5 relative">
        {/* HEADER MONTH */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setPickerMode("month");
              setShowPicker(!showPicker);
            }}
            className="text-lg font-semibold text-slate-800 hover:opacity-80"
          >
            {monthName}, {currentYear}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-full hover:bg-slate-100"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={nextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100"
            >
              <ChevronRight size={18} className="text-orange-500" />
            </button>
          </div>
        </div>

        {/* DROPDOWN PICKER */}
        {showPicker && (
          <div className="absolute z-20 bg-white border border-slate-200 shadow-md rounded-lg p-3 top-10 left-0 w-full">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setPickerMode("month")}
                className={`px-3 py-1 rounded-full text-sm ${
                  pickerMode === "month"
                    ? "bg-orange-400 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Month
              </button>

              <button
                onClick={() => setPickerMode("year")}
                className={`px-3 py-1 rounded-full text-sm ${
                  pickerMode === "year"
                    ? "bg-orange-400 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Year
              </button>
            </div>

            {pickerMode === "month" && (
              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, index) => (
                  <button
                    key={m}
                    onClick={() => {
                      setCurrentMonth(index);
                      setShowPicker(false);
                    }}
                    className={`py-2 rounded-md text-sm ${
                      index === currentMonth
                        ? "bg-orange-400 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            {pickerMode === "year" && (
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {Array.from({ length: 25 }, (_, i) => currentYear - 12 + i).map(
                  (year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setCurrentYear(year);
                        setShowPicker(false);
                      }}
                      className={`py-2 rounded-md text-sm ${
                        year === currentYear
                          ? "bg-orange-400 text-white"
                          : "bg-slate-100"
                      }`}
                    >
                      {year}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {/* FULL GRID CALENDAR (42 CELLS) */}
        <div className="grid grid-cols-7 gap-1.5 mt-1 w-full">
          {calendarDays.map((item, idx) => {
            const isSelected =
              item.type === "current" && selectedDate === item.day;

            const isStreak =
              item.type === "current" && streakDays.includes(item.day);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(item.day, item.type)}
                className={`
                  relative 
                  aspect-square
                  min-w-0
                  flex items-center justify-center 
                  rounded-full text-xs sm:text-sm font-medium transition
                  hover:bg-slate-100
                  ${
                    item.type === "current"
                      ? isSelected
                        ? "bg-orange-400 text-white hover:bg-orange-500"
                        : "bg-white text-slate-800"
                      : "bg-white text-slate-300"
                  }
                `}
              >
                {item.day}

                {isStreak && !isSelected && item.type === "current" && (
                  <span className="absolute inset-0 rounded-full border-[2.5px] border-orange-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* --- DIALOG / MODAL --- */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowDialog(false)}
          />

          {/* Dialog Content */}
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Dialog */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Detail Tanggal
                </h3>
                <p className="text-sm text-slate-500">
                  {activeDialogDate?.toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowDialog(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Dynamic Content Area */}
            <div className="bg-slate-50 rounded-xl p-4 min-h-[100px] text-sm text-slate-600 border border-slate-100">
              <p>
                Konten untuk tanggal{" "}
                <span className="font-semibold text-orange-500">
                  {activeDialogDate?.getDate()}
                </span>{" "}
                ada di sini.
              </p>

              {streakDays.includes(activeDialogDate?.getDate() || 0) &&
              activeDialogDate?.getMonth() === currentMonth ? (
                <div className="mt-3 flex items-center gap-2 text-green-600 font-medium">
                  <span>🔥</span> Streak terjaga hari ini!
                </div>
              ) : (
                <div className="mt-3 text-slate-400 italic">
                  Tidak ada aktivitas tercatat.
                </div>
              )}
            </div>

            {/* Footer Action */}
            <button
              onClick={() => setShowDialog(false)}
              className="w-full mt-4 bg-orange-400 hover:bg-orange-500 text-white font-medium py-2.5 rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
