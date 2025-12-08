"use client";

import { useState } from "react";
import { Bell, CircleCheck, Dot } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  time: string;
  read: boolean;
};

export default function NotificationsCard() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "You completed 3 habits today!",
      time: "5 min ago",
      read: false,
    },
    {
      id: 2,
      title: "New habit suggestion is available.",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 3,
      title: "Daily reminder: Stay on track 💪",
      time: "Yesterday",
      read: false,
    },
  ]);

  const toggleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div
      className="
        rounded-2xl bg-white shadow-sm border border-slate-100 
        p-5 mt-4
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <Bell size={18} className="text-orange-500" /> Notifications
        </h2>

        <button
          onClick={markAllRead}
          className="text-xs text-slate-500 hover:text-slate-700 transition"
        >
          Mark all read
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => toggleRead(n.id)}
            className={`
              w-full text-left flex items-start gap-3 p-3 rounded-xl transition
              ${n.read ? "bg-slate-50" : "bg-orange-50"} 
            `}
          >
            {/* Icon / Unread dot */}
            {n.read ? (
              <CircleCheck size={20} className="text-green-500 mt-1" />
            ) : (
              <Dot size={32} className="text-orange-500 -ml-1" />
            )}

            {/* TEXT */}
            <div className="flex-1">
              <p
                className={`text-sm ${
                  n.read ? "text-slate-600" : "text-slate-800 font-medium"
                }`}
              >
                {n.title}
              </p>
              <p className="text-xs text-slate-400 mt-1">{n.time}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
