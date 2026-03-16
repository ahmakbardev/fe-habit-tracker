// app/(main)/habits/components/AddHabitModal.tsx
"use client";
import { useState } from "react";
import {
  X,
  Plus,
  Zap,
  Clock,
  ChevronDown,
  Check,
  Settings2,
} from "lucide-react";

export default function AddHabitModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, color: string, schedules: string[]) => void;
}) {
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 my-auto border border-white/20">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tighter leading-none">
              New Habit
            </h2>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-2">
              Personalize your journey
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-all"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="space-y-8">
          <div className="space-y-4">
            <input
              autoFocus
              className="w-full p-5 bg-gray-50 rounded-[1.5rem] border-none focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-700 text-lg"
              placeholder="Habit name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.class}
                  onClick={() => setColor(c.class)}
                  className={`flex-1 h-12 rounded-2xl transition-all ${
                    c.class
                  } ${
                    color === c.class
                      ? "ring-4 ring-offset-4 ring-gray-100 scale-105 shadow-lg"
                      : "opacity-40 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-gray-100 space-y-6">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">
                Frequency Mode
              </label>
              <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                {(["daily", "periodic", "custom"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all ${
                      mode === m
                        ? "bg-blue-600 text-white shadow-lg scale-[1.02]"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
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
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      Interval Config
                    </span>
                    <button
                      onClick={() => setIsCustomInterval(!isCustomInterval)}
                      className="text-blue-600 text-[9px] font-black uppercase flex items-center gap-1 hover:underline"
                    >
                      <Settings2 size={10} />{" "}
                      {isCustomInterval ? "Use Presets" : "Custom Minutes"}
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
                          className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-bold outline-none focus:border-blue-500 pr-10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                          Min
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setIsIntervalOpen(!isIntervalOpen)}
                          className="w-full p-3 bg-white rounded-xl border border-gray-100 text-xs font-bold flex items-center justify-between hover:border-blue-200 transition-colors"
                        >
                          Every{" "}
                          {intervalOptions.find(
                            (opt) => opt.value === intervalVal
                          )?.label || `${intervalVal}m`}
                          <ChevronDown
                            size={14}
                            className={`transition-transform ${
                              isIntervalOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isIntervalOpen && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                            {intervalOptions.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  setIntervalVal(opt.value);
                                  setIsIntervalOpen(false);
                                }}
                                className="w-full p-3 text-left text-xs font-bold hover:bg-blue-50 flex items-center justify-between transition-colors"
                              >
                                <span
                                  className={
                                    intervalVal === opt.value
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  }
                                >
                                  Every {opt.label}
                                </span>
                                {intervalVal === opt.value && (
                                  <Check size={14} className="text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={handleAutoGenerate}
                      className="w-full py-3 bg-gray-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-md active:scale-95"
                    >
                      <Zap size={14} className="fill-current" /> Generate
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="space-y-2 text-center border-r border-gray-100">
                    <span className="text-[9px] font-black text-gray-400 uppercase block">
                      Start
                    </span>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full p-1 bg-transparent text-center text-sm font-bold outline-none focus:text-blue-600"
                    />
                  </div>
                  <div className="space-y-2 text-center">
                    <span className="text-[9px] font-black text-gray-400 uppercase block">
                      End
                    </span>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full p-1 bg-transparent text-center text-sm font-bold outline-none focus:text-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {mode === "custom" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {customTimes.length} Active Slots
                  </span>
                  <button
                    onClick={() => setCustomTimes([...customTimes, "12:00"])}
                    className="text-blue-600 text-[10px] font-black uppercase flex items-center gap-1 hover:underline"
                  >
                    <Plus size={10} /> Add Time
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 max-h-[160px] overflow-y-auto p-1 scrollbar-hide">
                  {customTimes.map((time, idx) => (
                    <div key={idx} className="group relative">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...customTimes];
                          newTimes[idx] = e.target.value;
                          setCustomTimes(newTimes);
                        }}
                        className="w-full p-2.5 bg-white border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all shadow-sm"
                      />
                      <button
                        onClick={() =>
                          setCustomTimes(
                            customTimes.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === "daily" && (
              <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-4 animate-in fade-in">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                  <Clock size={24} />
                </div>
                <p className="text-[11px] font-bold text-blue-800 leading-tight">
                  This habit will have a single check-in slot per day. Perfect
                  for general tasks like &quot;No Alcohol&quot;.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-4 text-sm font-black text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!name || (mode !== "daily" && customTimes.length === 0)}
              onClick={() =>
                onSubmit(name, color, mode === "daily" ? [] : customTimes)
              }
              className="flex-[2] py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 transition shadow-2xl shadow-blue-200 disabled:opacity-30 active:scale-[0.98]"
            >
              Confirm Habit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
