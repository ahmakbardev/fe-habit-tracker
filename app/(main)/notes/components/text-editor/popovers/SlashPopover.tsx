// app/(main)/notes/components/text-editor/popovers/SlashPopover.tsx
"use client";

import { 
  Type, Bold, Heading1, Heading2, Heading3, 
  List, ListOrdered, SquareCheck, Quote, Code, 
  TableIcon, Columns2
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

type CommandItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
};

const COMMANDS: CommandItem[] = [
  { id: "h1", label: "Heading 1", icon: <Heading1 size={16} />, action: "h1" },
  { id: "h2", label: "Heading 2", icon: <Heading2 size={16} />, action: "h2" },
  { id: "h3", label: "Heading 3", icon: <Heading3 size={16} />, action: "h3" },
  { id: "bullet", label: "Bullet List", icon: <List size={16} />, action: "bullet" },
  { id: "number", label: "Numbered List", icon: <ListOrdered size={16} />, action: "number" },
  { id: "todo", label: "To-do List", icon: <SquareCheck size={16} />, action: "todo" },
  { id: "columns", label: "2 Columns", icon: <Columns2 size={16} />, action: "columns" },
  { id: "table", label: "Table", icon: <TableIcon size={16} />, action: "table" },
  { id: "quote", label: "Quote", icon: <Quote size={16} />, action: "quote" },
  { id: "code", label: "Code Block", icon: <Code size={16} />, action: "code" },
  { id: "bold", label: "Bold", icon: <Bold size={16} />, action: "bold" },
  { id: "extrabold", label: "Extra Bold", icon: <Type size={16} className="font-black" />, action: "extrabold" },
];

type Props = {
  onSelect: (action: string) => void;
  onClose: () => void;
  filter: string;
};

export default function SlashPopover({ onSelect, onClose, filter }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.label.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].action);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredCommands, selectedIndex, onSelect, onClose]);

  // Sync scroll with selection
  useEffect(() => {
    const activeEl = scrollRef.current?.children[selectedIndex + 1] as HTMLElement; // +1 because of the header
    if (activeEl && scrollRef.current) {
      const parent = scrollRef.current;
      const overTop = activeEl.offsetTop < parent.scrollTop;
      const overBottom = (activeEl.offsetTop + activeEl.offsetHeight) > (parent.scrollTop + parent.offsetHeight);
      
      if (overTop) parent.scrollTop = activeEl.offsetTop;
      else if (overBottom) parent.scrollTop = activeEl.offsetTop - parent.offsetHeight + activeEl.offsetHeight;
    }
  }, [selectedIndex]);

  if (filteredCommands.length === 0) return null;

  return (
    <div 
      ref={scrollRef}
      className="w-56 max-h-64 overflow-y-auto bg-white border border-slate-200 shadow-xl rounded-lg p-1 z-[2000] animate-in fade-in zoom-in duration-100"
    >
      <div className="px-2 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
        Commands
      </div>
      {filteredCommands.map((cmd, index) => (
        <button
          key={cmd.id}
          onClick={() => onSelect(cmd.action)}
          onMouseDown={(e) => e.preventDefault()} // PENTING: Jangan ambil fokus dari editor
          className={`
            w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors
            ${index === selectedIndex ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"}
          `}
        >
          <div className="text-slate-500">{cmd.icon}</div>
          <div className="text-sm font-medium">{cmd.label}</div>
        </button>
      ))}
    </div>
  );
}
