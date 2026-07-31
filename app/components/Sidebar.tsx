"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  NotebookPen,
  CheckCircle2,
  UserRound,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  GripVertical,
  CircleHelp,
  Settings,
  LucideIcon,
} from "lucide-react";
import clsx from "clsx";
import { NoteService } from "@/app/(main)/notes/services/note-service";
import { getIconByName } from "@/app/(main)/notes/utils/icon-utils";

type WorkspaceLink = {
  id: string;
  name: string;
  icon: LucideIcon;
};

const NAV_ITEMS: { key: string; label: string; icon: LucideIcon; href: string }[] = [
  { key: "Home", label: "Home", icon: Home, href: "/dashboard" },
  { key: "Habits", label: "Habits", icon: CheckCircle2, href: "/habits" },
  { key: "Tasks", label: "Tasks", icon: ClipboardCheck, href: "/tasks" },
  { key: "Notes", label: "Notes", icon: NotebookPen, href: "/notes" },
  { key: "Profile", label: "Profile", icon: UserRound, href: "/profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceLink[]>([]);

  const active = NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.key || "Home";

  useEffect(() => {
    let mounted = true;

    NoteService.getAll()
      .then((workspaces) => {
        if (!mounted) return;
        setWorkspaces(
          workspaces.map((ws) => ({
            id: ws.id,
            name: ws.name,
            icon: getIconByName(ws.icon_name || "Hash"),
          }))
        );
      })
      .catch(() => {
        if (mounted) setWorkspaces([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside
      className={clsx(
        "hidden md:flex h-full flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      {/* Logo + collapse toggle */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
            <Image src="/icons/favicon.svg" alt="HabitFlow" width={20} height={20} />
          </span>
          {!collapsed && (
            <span className="truncate text-[17px] font-bold text-slate-900">
              HabitFlow
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar"
          className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      {/* Create */}
      <div className="px-3 pt-2">
        <Link
          href="/tasks"
          title="Create"
          className={clsx(
            "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50",
            collapsed && "justify-center px-0"
          )}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!collapsed && "Create"}
        </Link>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto px-3">
        {/* General nav */}
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            General
          </p>
        )}
        <nav className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                title={item.label}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* My workspace */}
        {workspaces.length > 0 && (
          <div className="mt-6">
            {!collapsed ? (
              <div className="flex items-center justify-between px-3 pb-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  My Workspace
                </p>
                <Link
                  href="/notes"
                  title="Manage workspaces"
                  className="flex h-5 w-5 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="my-2 border-t border-slate-200" />
            )}

            <div className="space-y-0.5">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/notes?workspace=${ws.id}`}
                  title={ws.name}
                  className={clsx(
                    "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
                    collapsed && "justify-center px-0"
                  )}
                >
                  {!collapsed && (
                    <GripVertical className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100" />
                  )}
                  <ws.icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span className="truncate">{ws.name}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-slate-200 px-3 py-3">
        <button
          type="button"
          title="Get help"
          className={clsx(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
            collapsed && "justify-center px-0"
          )}
        >
          <CircleHelp className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && "Get help"}
        </button>
        <Link
          href="/profile"
          title="Settings"
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
            collapsed && "justify-center px-0"
          )}
        >
          <Settings className="h-[18px] w-[18px] flex-shrink-0" />
          {!collapsed && "Settings"}
        </Link>
      </div>
    </aside>
  );
}
