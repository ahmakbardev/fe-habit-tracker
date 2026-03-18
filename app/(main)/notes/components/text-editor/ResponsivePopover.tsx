"use client";

import React, { useState, useEffect } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useMediaQuery } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

type Props = {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  title?: string;
};

export default function ResponsivePopover({ trigger, children, title }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Desktop: Use Radix Popover
  if (!isMobile) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {trigger}
        </PopoverTrigger>
        <PopoverContent align="center" className="w-80 p-4 shadow-xl border-slate-100 rounded-xl">
          {children(() => setIsOpen(false))}
        </PopoverContent>
      </Popover>
    );
  }

  // Mobile: Use Custom Modal (Framer Motion) with Portal
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh] z-[1001]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800 tracking-tight text-base">
                {title || "Options"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors active:bg-slate-100"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto overscroll-contain text-slate-700">
              {children(() => setIsOpen(false))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer inline-block">
        {trigger}
      </div>
      {mounted && typeof document !== "undefined" ? createPortal(modalContent, document.body) : null}
    </>
  );
}
