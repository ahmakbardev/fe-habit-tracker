"use client";

import React, { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useMediaQuery } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  trigger: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  title?: string;
};

export default function ResponsivePopover({ trigger, children, title }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isOpen, setIsOpen] = useState(false);

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

  // Mobile: Use Custom Modal (Framer Motion)
  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-50">
                <h3 className="font-bold text-slate-800 tracking-tight">
                  {title || "Options"}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-slate-50 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {children(() => setIsOpen(false))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
