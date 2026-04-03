// app/(main)/notes/components/text-editor/ToolbarButton.tsx
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export default function ToolbarButton({
  icon,
  onClick,
  title,
  className,
}: {
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  className?: string;
}) {
  return (
    <button
      onMouseDown={(e) => {
        e.preventDefault(); // PENTING: Mencegah editor kehilangan fokus
        onClick();
      }}
      className={cn(
        "p-1 hover:bg-slate-100 rounded transition text-slate-600 active:bg-slate-200", 
        className
      )}
      title={title}
    >
      {icon}
    </button>
  );
}
