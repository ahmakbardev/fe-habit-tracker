"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface FloatingMenuItemProps {
  icon: ReactNode;
  label: string;
  href: string;
}

export default function FloatingMenuItem({
  icon,
  label,
  href,
}: FloatingMenuItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
    >
      <span className="text-slate-700">{icon}</span>
      <span className="text-xs font-medium text-slate-700">{label}</span>
    </Link>
  );
}
