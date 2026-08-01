"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  NotebookPen, CheckCircle2, ClipboardCheck, Users, CalendarClock,
  MessagesSquare, Handshake, ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { NoteService } from "../../notes/services/note-service";
import { HabitService } from "../../habits/services/habit-service";
import { ProfileData } from "@/lib/profile-service";

type TabId = "activity" | "clients" | "appointments" | "interviews" | "deals" | "tasks";

const TABS: { id: TabId; label: string }[] = [
  { id: "activity", label: "Activity" },
  { id: "clients", label: "Clients" },
  { id: "appointments", label: "Appointments" },
  { id: "interviews", label: "Interviews" },
  { id: "deals", label: "Deals" },
  { id: "tasks", label: "Tasks" },
];

type ActivityItem = {
  id: string;
  kind: "note" | "habit";
  title: string;
  timestamp: string;
};

function formatRelative(iso: string): string {
  const date = parseISO(iso);
  if (!isValid(date)) return "";
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

function EmptyState({ icon: Icon, label }: { icon: typeof Users; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
        <Icon size={20} />
      </div>
      <p className="text-sm font-semibold text-slate-500">No {label.toLowerCase()} yet</p>
      <p className="text-xs text-slate-400 mt-1">There&apos;s nothing to show here right now.</p>
    </div>
  );
}

export default function ProfileActivityPanel({ profile }: { profile: ProfileData }) {
  const [activeTab, setActiveTab] = useState<TabId>("activity");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([NoteService.getAll(), HabitService.getAll()])
      .then(([workspaces, habits]) => {
        if (!mounted) return;
        const notes: ActivityItem[] = workspaces.flatMap((w) =>
          w.folders.flatMap((f) =>
            f.notes.map((n) => ({
              id: `note-${n.id}`,
              kind: "note" as const,
              title: n.title || "Untitled note",
              timestamp: n.updated_at,
            }))
          )
        );
        const habitItems: ActivityItem[] = habits.map((h) => ({
          id: `habit-${h.id}`,
          kind: "habit" as const,
          title: h.name,
          timestamp: h.updated_at,
        }));
        const combined = [...notes, ...habitItems]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, 10);
        setActivity(combined);
      })
      .catch(() => mounted && setActivity([]))
      .finally(() => mounted && setLoadingActivity(false));
    return () => { mounted = false; };
  }, []);

  const emptyTabMeta = useMemo(() => ({
    clients: { icon: Users, label: "Clients" },
    appointments: { icon: CalendarClock, label: "Appointments" },
    interviews: { icon: MessagesSquare, label: "Interviews" },
    deals: { icon: Handshake, label: "Deals" },
  }), []);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="px-5 pt-4 border-b border-slate-100 flex items-center gap-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "flex items-center gap-1.5 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id ? "text-blue-600 border-blue-600" : "text-slate-400 border-transparent hover:text-slate-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === "activity" && (
          loadingActivity ? (
            <div className="flex items-center justify-center py-16 text-slate-300 text-sm">Loading activity...</div>
          ) : activity.length === 0 ? (
            <EmptyState icon={NotebookPen} label="Activity" />
          ) : (
            <div className="space-y-1">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    item.kind === "note" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                    {item.kind === "note" ? <NotebookPen size={14} /> : <CheckCircle2 size={14} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700 truncate">
                      {item.kind === "note" ? "Updated note" : "Updated habit"} &mdash; {item.title}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatRelative(item.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === "tasks" && (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
              <ClipboardCheck size={20} />
            </div>
            <p className="text-3xl font-black text-slate-800">{profile.stats.tasks}</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">total tasks across your projects</p>
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Go to Tasks <ArrowRight size={12} />
            </Link>
          </div>
        )}

        {(activeTab === "clients" || activeTab === "appointments" || activeTab === "interviews" || activeTab === "deals") && (
          <EmptyState icon={emptyTabMeta[activeTab].icon} label={emptyTabMeta[activeTab].label} />
        )}
      </div>
    </div>
  );
}
