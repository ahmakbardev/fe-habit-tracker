"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { NotificationService } from "@/lib/notification-service";

/**
 * Minimal icon-only reminder-permission trigger for the topbar. Only
 * renders while permission is still undecided — once granted or denied
 * there's nothing left to do here, so it disappears.
 */
export default function NotificationBellButton() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);
  }, []);

  if (permission !== "default") return null;

  const handleClick = async () => {
    setIsRequesting(true);
    try {
      await NotificationService.requestPermission();
    } finally {
      setPermission(Notification.permission);
      setIsRequesting(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isRequesting}
      title="Enable task reminders"
      className="p-2 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors disabled:opacity-50"
    >
      {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
    </button>
  );
}
