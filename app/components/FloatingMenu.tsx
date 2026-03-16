"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CheckCircle2,
  ClipboardCheck,
  NotebookPen,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function FloatingMenu() {
  const [isMobile, setIsMobile] = useState(false);
  const [active, setActive] = useState("Home");
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const mobileItems = [
    { key: "Habits", icon: <CheckCircle2 size={25} />, href: "/habits" },
    { key: "Tasks", icon: <ClipboardCheck size={25} />, href: "/tasks" },
    { key: "Home", icon: <LayoutDashboard size={26} />, href: "/dashboard" },
    { key: "Notes", icon: <NotebookPen size={25} />, href: "/notes" },
    { key: "Profile", icon: <UserRound size={25} />, href: "/profile" },
  ];

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 500);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-hide logic for desktop
  useEffect(() => {
    if (isMobile || open) {
      setIsMinimized(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isMobile, open, isMinimized]); // Re-run when state changes to restart timer

  const handleMouseEnter = () => {
    setIsMinimized(false);
  };

  if (isMobile) {
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
              <div
                key={item.key}
                className="relative w-full flex justify-center"
              >
                <motion.div
                  layoutId="homeFloat"
                  className="
                    absolute -top-8
                    bg-blue-600 text-white scale-125
                    w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg
                    border-4 border-slate-50/50
                    z-20  /* 🔥 UPDATE 1: Z-index tinggi agar selalu di atas garis yg lewat */
                  "
                >
                  {item.icon}
                </motion.div>
                <div className="w-14 h-10" />
              </div>
            );
          }

          // JIKA TOMBOL MENU BIASA
          return (
            <div
              key={item.key}
              className="relative flex items-center justify-center w-full"
            >
              <button
                onClick={() => setActive(item.key)}
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
                      z-0 /* 🔥 UPDATE 2: Z-index rendah (di bawah icon & di bawah Home) */
                    "
                  />
                )}

                {/* ICON */}
                {/* 🔥 UPDATE 3: Pastikan icon lebih tinggi dari garis (z-10) */}
                <span className="relative z-10">{item.icon}</span>
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------
  // DESKTOP FAB MENU
  // ---------------------
  return (
    <motion.div 
      onMouseEnter={handleMouseEnter}
      animate={{ x: isMinimized ? 40 : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-6 right-6 z-50 flex items-end gap-4"
    >
      <div
        className={clsx(
          "flex items-center gap-3 p-2 transition-opacity duration-300",
          isMinimized ? "opacity-40 hover:opacity-100" : "opacity-100"
        )}
        style={{ filter: "url(#gooey)" }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ clipPath: "inset(0% 0% 0% 100%)", opacity: 0 }}
              animate={{
                clipPath: "inset(0% 0% 0% 0%)",
                opacity: 1,
                transition: { duration: 0.35 },
              }}
              exit={{
                clipPath: "inset(0% 0% 0% 100%)",
                opacity: 0,
                transition: { duration: 0.25 },
              }}
              className="
                bg-white/80 border border-slate-200 rounded-2xl 
                px-4 py-2 flex items-center gap-2 
                backdrop-blur-xl overflow-hidden
              "
            >
              {mobileItems.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 12, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { delay: 0.05 * i },
                  }}
                  exit={{ opacity: 0, y: 12, scale: 0.8 }}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-slate-700"
                  >
                    {item.icon}
                    <span>{item.key}</span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.92 }}
          className="
            w-14 h-14 flex items-center justify-center 
            rounded-full bg-slate-900 text-white shadow-xl 
            hover:bg-slate-800 transition
          "
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </motion.button>
      </div>
    </motion.div>
  );
}
