"use client";

import { useState } from "react";
import { Clock, MapPin, Check, Square } from "lucide-react";

type TodoItem = {
  id: string;
  emoji: string;
  title: string;
  time: string;
  location: string;
  done: boolean;
};

const initialTodos: TodoItem[] = [
  {
    id: "1",
    emoji: "🧑‍🏫",
    title: "Study",
    time: "10:00am",
    location: "K-Cafe",
    done: false,
  },
  {
    id: "2",
    emoji: "🛒",
    title: "Groceries",
    time: "02:00pm",
    location: "Hayday Market",
    done: false,
  },
  {
    id: "3",
    emoji: "🥦",
    title: "Eat Healthy Food",
    time: "08:30am",
    location: "Home",
    done: true,
  },
  {
    id: "4",
    emoji: "📕",
    title: "Read a book",
    time: "08:00am",
    location: "Library",
    done: true,
  },
  {
    id: "5",
    emoji: "🏊‍♂️",
    title: "Swimming for 45min",
    time: "06:00am",
    location: "Gym Pool",
    done: false,
  },
];

export default function TodayTodos() {
  const [todos, setTodos] = useState(initialTodos);

  function toggleDone(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  return (
    <div className="w-full rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Today&apos;s Todos</h2>
        <button className="text-sm text-slate-500 hover:text-slate-700 transition">
          View Details
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
        {todos.map((item) => (
          <div
            key={item.id}
            className={`
        flex flex-row sm:items-center justify-between 
        gap-3 p-3 rounded-xl border transition shadow-sm
        ${
          item.done
            ? "border-green-200 bg-green-50"
            : "border-slate-200 bg-white"
        }
      `}
          >
            {/* LEFT SECTION */}
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <div className="text-2xl shrink-0">{item.emoji}</div>

              <div className="min-w-0">
                <p
                  className={`
              font-medium transition break-words
              ${item.done ? "line-through text-slate-400" : "text-slate-800"}
            `}
                >
                  {item.title}
                </p>

                {/* TIME + LOCATION */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {item.time}
                  </span>

                  <span className="text-slate-300">•</span>

                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {item.location}
                  </span>
                </div>
              </div>
            </div>

            {/* CHECKBOX BUTTON */}
            <div className="sm:self-center">
              <button
                onClick={() => toggleDone(item.id)}
                className="w-7 h-7 rounded-md flex items-center justify-center 
                     active:scale-95 transition"
              >
                {item.done ? (
                  <div className="bg-green-500 rounded-md w-7 h-7 flex items-center justify-center text-white">
                    <Check size={16} />
                  </div>
                ) : (
                  <Square size={22} className="text-slate-400" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
