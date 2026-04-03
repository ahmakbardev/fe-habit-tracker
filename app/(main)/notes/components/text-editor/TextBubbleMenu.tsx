"use client";

import { 
  Bold, Italic, Underline, Heading1, Heading2, Heading3, 
  List, ListOrdered, SquareCheck, Quote, Code, 
  ChevronRight, ChevronLeft, Undo, Redo, Type, Highlighter
} from "lucide-react";
import { 
  cmdBold, cmdExtraBold, cmdItalic, cmdUnderline, 
  cmdHeading1, cmdHeading2, cmdHeading3,
  cmdListItem, cmdOrderedList, cmdChecklist,
  cmdBlockquote, cmdCode, cmdUndo, cmdRedo
} from "./commands";
import { RefObject } from "react";

type Props = {
  editorRef: RefObject<HTMLDivElement>;
  onChange: (html: string) => void;
  onClose: () => void;
  isList?: boolean;
};

export default function TextBubbleMenu({ editorRef, onChange, onClose, isList }: Props) {
  const handleAction = (action: (ref: RefObject<HTMLDivElement>, onChange: (v: string) => void) => void) => {
    action(editorRef, onChange);
  };

  const handleIndent = (dir: "in" | "out") => {
    if (dir === "in") document.execCommand("indent");
    else document.execCommand("outdent");
    onChange(editorRef.current?.innerHTML || "");
  };

  const handleHighlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    const mark = document.createElement("mark");
    mark.className = "bg-yellow-200 text-slate-900 px-1 rounded";
    
    try {
      mark.appendChild(range.extractContents());
      range.insertNode(mark);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
    } catch (e) {
      console.error("Highlight error:", e);
    }
  };

  return (
    <div 
      className="flex items-center gap-0.5 p-1 bg-slate-900 text-white rounded-lg shadow-xl animate-in fade-in zoom-in duration-200 flex-wrap max-w-[calc(100vw-2rem)] md:max-w-[460px] justify-center"
      onMouseDown={(e) => e.preventDefault()} // Cegah hilangnya fokus
    >
      {/* HISTORY */}
      <button onClick={() => handleAction(cmdUndo)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Undo"><Undo size={14} /></button>
      <button onClick={() => handleAction(cmdRedo)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Redo"><Redo size={14} /></button>
      
      <div className="w-px h-4 bg-slate-700 mx-1" />

      {/* BASIC FORMATTING */}
      <button onClick={() => handleAction(cmdBold)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Bold"><Bold size={16} /></button>
      <button onClick={() => handleAction(cmdExtraBold)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Extra Bold">
        <div className="relative">
          <Type size={16} className="font-black" />
          <span className="absolute -top-1 -right-1 text-[7px] font-bold bg-slate-100 text-slate-900 rounded-sm px-0.5">
            +
          </span>
        </div>
      </button>
      <button onClick={() => handleAction(cmdItalic)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Italic"><Italic size={16} /></button>
      <button onClick={() => handleAction(cmdUnderline)} className="p-1.5 hover:bg-slate-700 rounded transition"><Underline size={16} /></button>
      <button onClick={handleHighlight} className="p-1.5 hover:bg-slate-700 rounded transition" title="Highlight"><Highlighter size={16} /></button>
      
      <div className="w-px h-4 bg-slate-700 mx-1" />

      {/* HEADINGS */}
      <button onClick={() => handleAction(cmdHeading1)} className="p-1.5 hover:bg-slate-700 rounded transition font-bold text-xs" title="Heading 1">H1</button>
      <button onClick={() => handleAction(cmdHeading2)} className="p-1.5 hover:bg-slate-700 rounded transition font-bold text-xs" title="Heading 2">H2</button>
      <button onClick={() => handleAction(cmdHeading3)} className="p-1.5 hover:bg-slate-700 rounded transition font-bold text-xs" title="Heading 3">H3</button>

      <div className="w-px h-4 bg-slate-700 mx-1" />

      {/* LISTS / BLOCKS */}
      {isList ? (
        <>
          <button onClick={() => handleIndent("out")} className="p-1.5 hover:bg-slate-700 rounded transition" title="Outdent"><ChevronLeft size={16} /></button>
          <button onClick={() => handleIndent("in")} className="p-1.5 hover:bg-slate-700 rounded transition" title="Indent"><ChevronRight size={16} /></button>
          <div className="w-px h-4 bg-slate-700 mx-1" />
        </>
      ) : null}

      <button onClick={() => handleAction(cmdListItem)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Bullet List"><List size={16} /></button>
      <button onClick={() => handleAction(cmdChecklist)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Checklist"><SquareCheck size={16} /></button>
      
      <div className="w-px h-4 bg-slate-700 mx-1" />

      <button onClick={() => handleAction(cmdBlockquote)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Quote"><Quote size={16} /></button>
      <button onClick={() => handleAction(cmdCode)} className="p-1.5 hover:bg-slate-700 rounded transition" title="Code"><Code size={16} /></button>
    </div>
  );
}
