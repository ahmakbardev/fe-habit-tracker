"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const today = new Date();

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(
    today.getDate()
  );

  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"month" | "year">("month");

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

  function prevMonth() {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function nextMonth() {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  return (
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
      {/* FULL GRID CALENDAR (42 CELLS) */}
      <div
        className="
  grid grid-cols-7 gap-1.5 mt-1
  w-full
"
      >
        {calendarDays.map((item, idx) => {
          const isSelected =
            item.type === "current" && selectedDate === item.day;

          const isStreak =
            item.type === "current" && streakDays.includes(item.day);

          return (
            <button
              key={idx}
              onClick={() => {
                if (item.type === "current") {
                  setSelectedDate(item.day);
                } else if (item.type === "prev") {
                  setCurrentMonth((prev) => {
                    if (prev === 0) {
                      setCurrentYear((y) => y - 1);
                      return 11;
                    }
                    return prev - 1;
                  });
                  setSelectedDate(item.day);
                } else if (item.type === "next") {
                  setCurrentMonth((prev) => {
                    if (prev === 11) {
                      setCurrentYear((y) => y + 1);
                      return 0;
                    }
                    return prev + 1;
                  });
                  setSelectedDate(item.day);
                }
              }}
              className={`
          relative 
          aspect-square   /* <-- otomatis kotak */
          min-w-0         /* <-- cegah overflow */
          flex items-center justify-center 
          rounded-full text-xs sm:text-sm font-medium transition

          ${
            item.type === "current"
              ? isSelected
                ? "bg-orange-400 text-white"
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
  );
}
