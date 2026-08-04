"use client";

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Heading } from "../toc-utils";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, [headings]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
    window.history.replaceState(null, "", `#${id}`);
  };

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
        <List className="w-3.5 h-3.5" />
        On this page
      </div>
      <ul className="space-y-0.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => handleClick(e, h.id)}
              style={{ paddingLeft: `${(h.level - minLevel) * 0.75 + 0.75}rem` }}
              className={cn(
                "block border-l-2 py-1 text-sm leading-snug transition-colors truncate",
                activeId === h.id
                  ? "border-blue-500 text-blue-600 font-medium"
                  : "border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
              )}
              title={h.text}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
