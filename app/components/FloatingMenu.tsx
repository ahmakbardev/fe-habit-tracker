"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  ClipboardCheck,
  NotebookPen,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FloatingMenu() {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  const mobileItems = [
    { key: "Habits", icon: <CheckCircle2 size={25} />, href: "/habits" },
    { key: "Tasks", icon: <ClipboardCheck size={25} />, href: "/tasks" },
    { key: "Home", icon: <LayoutDashboard size={26} />, href: "/dashboard" },
    { key: "Notes", icon: <NotebookPen size={25} />, href: "/notes" },
    { key: "Profile", icon: <UserRound size={25} />, href: "/profile" },
  ];

  // Logic to determine active item based on pathname
  const active = mobileItems.find(item => pathname.startsWith(item.href))?.key || "Home";

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Desktop navigation now lives in the persistent sidebar.
  if (!isMobile) return null;

  return (
    <div
      className="
      fixed bottom-5 left-1/2 -translate-x-1/2
      bg-white shadow-xl rounded-3xl border
      w-[92%] max-w-[420px]
      px-2 py-4 flex items-center justify-between
      z-50
    "
    >
      {mobileItems.map((item) => {
        const isHome = item.key === "Home";
        const isActive = active === item.key;

        // JIKA TOMBOL HOME (TENGAH)
        if (isHome) {
          return (
            <Link
              key={item.key}
              href={item.href}
              className="relative w-full flex justify-center"
            >
              <motion.div
                layoutId="homeFloat"
                className="
                  absolute -top-8
                  bg-blue-600 text-white scale-125
                  w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                  border-4 border-slate-50/50
                  z-20
                "
              >
                {item.icon}
              </motion.div>
              <div className="w-14 h-10" />
            </Link>
          );
        }

        // JIKA TOMBOL MENU BIASA
        return (
          <div
            key={item.key}
            className="relative flex items-center justify-center w-full"
          >
            <Link
              href={item.href}
              className={`
                relative flex flex-col items-center justify-center p-2 rounded-xl transition-colors duration-300
                ${
                  isActive
                    ? "text-slate-900"
                    : "text-slate-400 hover:text-slate-600"
                }
              `}
            >
              {/* ACTIVE LINE */}
              {isActive && (
                <motion.div
                  layoutId="activeLine"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                  className="
                    absolute -top-3
                    w-10 h-1
                    bg-slate-900 rounded-full
                    z-0
                  "
                />
              )}

              {/* ICON */}
              <span className="relative z-10">{item.icon}</span>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
