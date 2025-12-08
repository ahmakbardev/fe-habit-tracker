"use client";

import { Calendar, Loader2, AlertTriangle } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

// ======================================================
// RESPONSIVE HOOK (Tidak berubah)
// ======================================================
function useResponsiveValues() {
  const [values, setValues] = useState({
    hourWidth: 100,
    rowHeight: 60,
  });

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setValues({ hourWidth: 60, rowHeight: 48 });
      } else if (w < 768) {
        setValues({ hourWidth: 80, rowHeight: 56 });
      } else {
        setValues({ hourWidth: 100, rowHeight: 60 });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return values;
}

// ======================================================
// TIPE DATA & UTIL (Tidak berubah)
// ======================================================
interface Activity {
  id: number;
  title: string;
  start: string;
  end: string;
  color: string;
}

interface ActivityWithLane extends Activity {
  startMinutes: number;
  endMinutes: number;
  lane: number;
}

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function calculateActivityLanes(activities: Activity[]): ActivityWithLane[] {
  if (!activities.length) return [];
  const sorted: ActivityWithLane[] = activities
    .map((a) => ({
      ...a,
      startMinutes: timeToMinutes(a.start),
      endMinutes: timeToMinutes(a.end),
      lane: -1,
    }))
    .sort((a, b) => a.startMinutes - b.startMinutes);

  const lanes: ActivityWithLane[][] = [];
  for (const act of sorted) {
    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (act.startMinutes >= last.endMinutes) {
        act.lane = i;
        lanes[i].push(act);
        placed = true;
        break;
      }
    }
    if (!placed) {
      act.lane = lanes.length;
      lanes.push([act]);
    }
  }
  return sorted.sort((a, b) => a.id - b.id);
}

const getBackgroundColor = (color: string) => {
  const map: Record<string, string> = {
    blue: "bg-blue-100/70 border-blue-400 text-blue-800",
    purple: "bg-purple-100/70 border-purple-400 text-purple-800",
    green: "bg-green-100/70 border-green-400 text-green-800",
    red: "bg-red-100/70 border-red-400 text-red-800",
    orange: "bg-orange-100/70 border-orange-400 text-orange-800",
  };
  return map[color] ?? "bg-slate-100/70 border-slate-400 text-slate-800";
};

// ======================================================
// DUMMY DATA (Tidak berubah)
// ======================================================
const DUMMY_ACTIVITIES: Activity[] = [
  {
    id: 1,
    title: "Weekly Project Review",
    start: "09:00",
    end: "12:00",
    color: "blue",
  },
  {
    id: 2,
    title: "Collaboration Session",
    start: "10:30",
    end: "13:30",
    color: "purple",
  },
  {
    id: 3,
    title: "Content Creation",
    start: "12:30",
    end: "15:30",
    color: "green",
  },
  {
    id: 4,
    title: "User Testing Feedback",
    start: "14:00",
    end: "17:00",
    color: "red",
  },
  {
    id: 5,
    title: "Design Research",
    start: "11:30",
    end: "14:00",
    color: "orange",
  },
  {
    id: 6,
    title: "Late Night Commit",
    start: "22:00",
    end: "23:00",
    color: "blue",
  },
];

const fetchActivities = () =>
  new Promise<Activity[]>((res) =>
    setTimeout(() => res(DUMMY_ACTIVITIES), 1000)
  );

// ======================================================
// MAIN COMPONENT
// ======================================================
export default function Timeline24Hour() {
  const { hourWidth, rowHeight } = useResponsiveValues();
  const PX_PER_MINUTE = hourWidth / 60;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchActivities();
        setActivities(data);
      } catch {
        setError("Gagal memuat data aktivitas.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const lanes = calculateActivityLanes(activities);
  const maxLane = lanes.length ? Math.max(...lanes.map((a) => a.lane)) : 0;
  const activityAreaHeight = (maxLane + 1) * (rowHeight + 12);

  useEffect(() => {
    if (!isLoading && lanes.length && scrollContainerRef.current) {
      const earliest = [...lanes].sort(
        (a, b) => a.startMinutes - b.startMinutes
      )[0];
      const pos = earliest.startMinutes * PX_PER_MINUTE - hourWidth * 2;
      scrollContainerRef.current.scrollLeft = Math.max(0, pos);
    }
  }, [isLoading, lanes, PX_PER_MINUTE, hourWidth]);

  if (isLoading)
    return (
      <Wrapper>
        <Loader2 className="animate-spin mr-2" /> Memuat aktivitas...
      </Wrapper>
    );
  if (error)
    return (
      <Wrapper error>
        <AlertTriangle className="mb-1" /> {error}
      </Wrapper>
    );
  if (!activities.length)
    return (
      <Wrapper>
        <Calendar className="mr-2" /> Tidak ada aktivitas hari ini.
      </Wrapper>
    );

  // ======================================================
  // TIMELINE UI
  // ======================================================
  return (
    // 🔥 FINAL FIX 1: Gunakan 'flex flex-col' dan 'overflow-hidden' di root container
    // Ini memastikan container utama tidak pernah melebihi parentnya.
    <div className="flex flex-col w-full max-w-full max-h-[500px] max-md:mb-28 overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 md:p-6 pb-2 bg-white z-20">
        <h2 className="text-lg md:text-xl font-bold text-slate-800">
          🗓️ 24 Hour Timeline
        </h2>
        <div className="flex items-center gap-2 text-xs md:text-sm bg-slate-100 px-3 py-1.5 rounded-lg border">
          <Calendar size={16} /> May 11, 2025
        </div>
      </div>

      {/* 🔥 FINAL FIX 2: Wrapper "Grid" ini adalah trik CSS.
          Dengan membuat grid minmax(0, 1fr), kita memaksa child element (scroll area)
          untuk punya "min-width: 0", sehingga dia mau mengecil dan memunculkan scrollbar
          meskipun konten dalamnya 2400px. */}
      <div className="grid grid-cols-1 w-full flex-1 overflow-hidden relative">
        {/* SCROLL AREA: w-full dan overflow-x-auto diletakkan di sini */}
        <div
          className="w-full overflow-x-auto overflow-y-auto p-4 md:p-6 pt-0"
          ref={scrollContainerRef}
        >
          <div style={{ minWidth: 24 * hourWidth, position: "relative" }}>
            {/* HOURS SCALE */}
            <div style={{ width: 24 * hourWidth }}>
              <div className="sticky top-0 bg-white pt-2 border-b shadow-sm z-10">
                <div className="flex text-[10px] md:text-xs text-slate-500 pb-2">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ width: hourWidth }}
                      className="text-center flex-shrink-0"
                    >
                      {String(i).padStart(2, "0")}:00
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ACTIVITIES */}
            <div
              className="relative mt-2"
              style={{
                height: activityAreaHeight,
                width: 24 * hourWidth,
              }}
            >
              {/* GRID LINES */}
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-dashed border-slate-200"
                  style={{ left: (i + 1) * hourWidth }}
                />
              ))}

              {/* ACTIVITY BARS */}
              {lanes.map((a) => {
                const left = a.startMinutes * PX_PER_MINUTE;
                const width = (a.endMinutes - a.startMinutes) * PX_PER_MINUTE;
                const top = a.lane * (rowHeight + 12);

                return (
                  <div
                    key={a.id}
                    className={`absolute rounded-lg px-3 py-2 border ${getBackgroundColor(
                      a.color
                    )}`}
                    style={{
                      left,
                      width,
                      top,
                      height: rowHeight,
                      minWidth: 70,
                    }}
                  >
                    <div className="truncate font-medium text-xs md:text-sm">
                      {a.title}
                    </div>
                    <div className="text-[10px] opacity-80">
                      {a.start} — {a.end}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// WRAPPER
function Wrapper({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`w-full max-w-full flex justify-center items-center h-48 rounded-lg border p-4 text-sm md:text-lg ${
        error
          ? "bg-red-50 border-red-200 text-red-700"
          : "bg-slate-50 border-slate-200 text-slate-600"
      }`}
    >
      {children}
    </div>
  );
}
