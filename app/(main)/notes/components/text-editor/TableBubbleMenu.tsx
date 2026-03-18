"use client";

import {
  Plus,
  Trash2,
  Columns,
  Rows,
  Maximize2,
  Minimize2,
  Minus, // Import icon Minus
} from "lucide-react";

type Props = {
  tableEl: HTMLTableElement;
  onUpdate: () => void;
};

import {
  addRow,
  addColumn,
  deleteRow, // Import fungsi baru
  deleteColumn, // Import fungsi baru
  removeTable,
  toggleTableWidth,
} from "./table-utils";
import { useState } from "react";

export default function TableBubbleMenu({ tableEl, onUpdate }: Props) {
  const [isFullWidth, setIsFullWidth] = useState(
    tableEl.classList.contains("w-full")
  );

  const handleAction = (action: () => void) => {
    action();
    onUpdate();
  };

  return (
    <div
      className="absolute z-50 flex items-center gap-1 p-1 bg-white rounded-lg shadow-lg border border-slate-200 -top-12 left-0 animate-in fade-in zoom-in-95 duration-150"
      contentEditable={false}
    >
      {/* --- ROW ACTIONS --- */}
      <div className="flex items-center bg-slate-50 rounded border border-slate-100">
        <button
          onClick={() => handleAction(() => deleteRow(tableEl))}
          className="p-1.5 text-slate-500 hover:text-red-500 transition border-r border-slate-200"
          title="Remove Last Row"
        >
          <div className="relative">
            <Rows className="w-4 h-4" />
            <Minus className="w-2.5 h-2.5 absolute -bottom-1 -right-1 bg-white rounded-full text-red-500" />
          </div>
        </button>
        <button
          onClick={() => handleAction(() => addRow(tableEl))}
          className="p-1.5 text-slate-500 hover:text-blue-600 transition"
          title="Add Row Bottom"
        >
          <div className="relative">
            <Rows className="w-4 h-4" />
            <Plus className="w-2.5 h-2.5 absolute -bottom-1 -right-1 bg-white rounded-full text-blue-600" />
          </div>
        </button>
      </div>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      {/* --- COLUMN ACTIONS --- */}
      <div className="flex items-center bg-slate-50 rounded border border-slate-100">
        <button
          onClick={() => handleAction(() => deleteColumn(tableEl))}
          className="p-1.5 text-slate-500 hover:text-red-500 transition border-r border-slate-200"
          title="Remove Last Column"
        >
          <div className="relative">
            <Columns className="w-4 h-4" />
            <Minus className="w-2.5 h-2.5 absolute -bottom-1 -right-1 bg-white rounded-full text-red-500" />
          </div>
        </button>
        <button
          onClick={() => handleAction(() => addColumn(tableEl))}
          className="p-1.5 text-slate-500 hover:text-blue-600 transition"
          title="Add Column Right"
        >
          <div className="relative">
            <Columns className="w-4 h-4" />
            <Plus className="w-2.5 h-2.5 absolute -bottom-1 -right-1 bg-white rounded-full text-blue-600" />
          </div>
        </button>
      </div>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      {/* Toggle Width */}
      <button
        onClick={() => {
          toggleTableWidth(tableEl);
          setIsFullWidth(!isFullWidth);
          onUpdate();
        }}
        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded hover:text-black transition"
        title={isFullWidth ? "Shrink Width" : "Full Width"}
      >
        {isFullWidth ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </button>

      <div className="w-px h-4 bg-slate-200 mx-1"></div>

      {/* Delete Table */}
      <button
        onClick={() => handleAction(() => removeTable(tableEl))}
        className="flex items-center gap-1 p-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded transition"
        title="Delete Entire Table"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
