"use client";

import Link from "next/link";
import { ArrowUpRight, NotebookPen } from "lucide-react";

export default function TryFeatureCard() {
  return (
    <div className="relative rounded-2xl p-5 h-full overflow-hidden bg-slate-900 text-white shadow-[0_10px_28px_-10px_rgba(15,23,42,0.55)] flex flex-col justify-between">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-fuchsia-500/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-6 w-40 h-40 bg-sky-500/30 rounded-full blur-3xl" />
      <div className="absolute top-8 right-10 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl" />

      <div className="relative">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">
          Let&apos;s try new feature
        </p>
        <p className="text-2xl font-serif italic mt-1">Journaling</p>
      </div>

      <div className="relative mt-6 space-y-2.5">
        <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2.5 text-xs text-white/60">
          <NotebookPen size={14} />
          Write a summary of your day
        </div>
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 bg-white text-slate-900 text-xs font-bold px-4 py-2.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          Try now <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  );
}
