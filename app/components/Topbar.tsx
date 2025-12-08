"use client";

export default function Topbar() {
  return (
    <header className="w-full h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between">
      <h2 className="text-lg font-semibold">Today</h2>

      <button className="md:hidden px-3 py-1.5 rounded-md border text-sm">
        Menu
      </button>
    </header>
  );
}
