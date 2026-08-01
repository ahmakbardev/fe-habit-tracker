"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/auth-service";
import InstallAppButton from "./InstallAppButton";
import NotificationBellButton from "./NotificationBellButton";

export default function Topbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await AuthService.logout();
    router.replace("/login");
  };

  return (
    <header className="w-full h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Today</h2>

      <div className="flex items-center gap-1">
        <InstallAppButton />
        <NotificationBellButton />
        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
