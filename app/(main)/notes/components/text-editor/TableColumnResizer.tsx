// app/(main)/notes/components/text-editor/TableColumnResizer.tsx
import React, { useEffect, useState, useCallback } from "react";
import { ensureColgroup, resizeColumn } from "./table-utils";

type Props = {
  editorRef: React.RefObject<HTMLDivElement>;
  tableEl: HTMLTableElement | null;
  onResizeEnd: () => void;
};

type Handle = { left: number; top: number; height: number };

export default function TableColumnResizer({ editorRef, tableEl, onResizeEnd }: Props) {
  const [handles, setHandles] = useState<Handle[]>([]);

  // --- KALKULASI POSISI HANDLE (satu per batas antar kolom) ---
  const updateHandlePositions = useCallback(() => {
    const container = editorRef.current?.parentElement;
    const headerRow = tableEl?.querySelector("tr");
    if (!tableEl || !container || !headerRow) {
      setHandles([]);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const tableRect = tableEl.getBoundingClientRect();
    const cells = Array.from(headerRow.children) as HTMLElement[];

    const next = cells.slice(0, -1).map((cell) => {
      const rect = cell.getBoundingClientRect();
      return {
        left: rect.right - containerRect.left,
        top: tableRect.top - containerRect.top,
        height: tableRect.height,
      };
    });

    setHandles(next);
  }, [tableEl, editorRef]);

  // --- LISTENERS (samakan dengan ImageResizer agar overlay tidak "lari") ---
  useEffect(() => {
    if (!tableEl) return;

    updateHandlePositions();

    window.addEventListener("resize", updateHandlePositions);

    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("scroll", updateHandlePositions);
      editor.addEventListener("input", updateHandlePositions);
      editor.addEventListener("keyup", updateHandlePositions);
      editor.addEventListener("click", updateHandlePositions);
    }

    const observer = new MutationObserver(updateHandlePositions);
    if (editor) {
      observer.observe(editor, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener("resize", updateHandlePositions);
      if (editor) {
        editor.removeEventListener("scroll", updateHandlePositions);
        editor.removeEventListener("input", updateHandlePositions);
        editor.removeEventListener("keyup", updateHandlePositions);
        editor.removeEventListener("click", updateHandlePositions);
      }
      observer.disconnect();
    };
  }, [tableEl, editorRef, updateHandlePositions]);

  // --- HANDLER RESIZE (realtime, seperti ImageResizer) ---
  const handleStart = (e: React.MouseEvent | React.TouchEvent, colIndex: number) => {
    e.stopPropagation();
    if (!tableEl) return;

    const colgroup = ensureColgroup(tableEl);
    if (!colgroup) return;
    const col = colgroup.children[colIndex] as HTMLElement | undefined;
    if (!col) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const startX = clientX;
    const startWidth = parseFloat(col.style.width) || col.getBoundingClientRect().width;

    const onMove = (moveEvent: MouseEvent | TouchEvent) => {
      const currentX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const diffX = currentX - startX;
      resizeColumn(tableEl, colIndex, startWidth + diffX);
      updateHandlePositions();
    };

    const onEnd = () => {
      onResizeEnd();
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
  };

  if (!tableEl || handles.length === 0) return null;

  return (
    <>
      {handles.map((handle, i) => (
        <div
          key={i}
          onMouseDown={(e) => handleStart(e, i)}
          onTouchStart={(e) => handleStart(e, i)}
          className="absolute z-50 w-2.5 -translate-x-1/2 cursor-col-resize group/col-resizer"
          style={{ left: handle.left, top: handle.top, height: handle.height }}
        >
          <div className="mx-auto h-full w-0.5 rounded-full bg-transparent transition-colors group-hover/col-resizer:bg-blue-500/60" />
        </div>
      ))}
    </>
  );
}
