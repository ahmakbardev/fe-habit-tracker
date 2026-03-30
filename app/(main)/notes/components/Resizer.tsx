"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import clsx from "clsx";

interface ResizerProps extends HTMLAttributes<HTMLDivElement> {
  onResize: (deltaX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  direction?: "left" | "right";
}

export default function Resizer({ 
  onResize, 
  onResizeStart, 
  onResizeEnd, 
  direction = "right", 
  className, 
  ...props 
}: ResizerProps) {
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Mencegah pemilihan teks saat meresize
      e.preventDefault();
      onResize(e.movementX);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      onResizeEnd?.();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, onResize, onResizeEnd]);

  return (
    <div
      {...props}
      onMouseDown={(e) => {
        e.preventDefault();
        setIsResizing(true);
        onResizeStart?.();
      }}
      className={clsx(
        "absolute top-0 bottom-0 w-2 cursor-col-resize z-[100] group",
        direction === "right" ? "-right-1" : "-left-1",
        className
      )}
    >
      {/* Garis Visual */}
      <div className={clsx(
        "h-full w-[2px] mx-auto transition-colors duration-200",
        isResizing ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" : "bg-transparent group-hover:bg-slate-300"
      )} />
    </div>
  );
}
