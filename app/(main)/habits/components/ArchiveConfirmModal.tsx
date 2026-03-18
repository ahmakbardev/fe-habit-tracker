// app/(main)/habits/components/ArchiveConfirmModal.tsx
"use client";
import { AlertTriangle, Archive, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/lib/utils";
import clsx from "clsx";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  habitName: string;
  isLoading?: boolean;
};

export default function ArchiveConfirmModal({ isOpen, onClose, onConfirm, habitName, isLoading }: Props) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center  md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={clsx(
              "relative bg-white w-full shadow-2xl overflow-hidden border border-white/20",
              isMobile 
                ? "rounded-t-[3rem] p-8 pb-12" 
                : "max-w-sm rounded-[3rem] p-10"
            )}
          >
            {/* Mobile Handle */}
            {isMobile && (
              <div className="flex justify-center mb-8">
                <div className="w-12 h-1.5 bg-slate-100 rounded-full" />
              </div>
            )}

            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mb-2">
                <Archive size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Archive Habit?</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed px-2">
                  Are you sure you want to archive <span className="text-slate-900 font-bold">&quot;{habitName}&quot;</span>? 
                  It will stop appearing from today onwards, but your past progress will be preserved.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="w-full py-5 bg-red-500 text-white rounded-[1.5rem] font-black text-sm hover:bg-red-600 transition-all shadow-xl shadow-red-200 active:scale-[0.98] uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Archiving...
                    </>
                  ) : (
                    "Yes, Archive"
                  )}
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-5 text-sm font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-[0.2em]"
                >
                  Cancel
                </button>
              </div>
            </div>

            {!isMobile && (
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-300"
              >
                <X size={20} />
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
