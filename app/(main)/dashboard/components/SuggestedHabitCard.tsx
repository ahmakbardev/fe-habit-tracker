"use client";

import { ChevronRight } from "lucide-react";

export type HabitItem = {
  id: string;
  icon: string;
  title: string;
  love: number;
};

type SuggestedHabitCardProps = {
  item: HabitItem;
  onClick: () => void;
};

export default function SuggestedHabitCard({
  item,
  onClick,
}: SuggestedHabitCardProps) {
  if (!item) {
    console.error("❌ SuggestedHabitCard: item is missing");
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="
        w-full p-3 bg-white rounded-2xl shadow-sm 
        flex items-center justify-between
        active:scale-[0.98] transition
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-3 text-left">
        <div className="text-3xl">{item.icon}</div>
        <div>
          <p className="font-semibold text-slate-800">{item.title}</p>
          <p className="text-xs text-slate-500">
            {item.love.toLocaleString()} love this
          </p>
        </div>
      </div>

      <ChevronRight size={20} className="text-orange-400" />
    </button>
  );
}
