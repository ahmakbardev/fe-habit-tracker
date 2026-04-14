"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import Toolbar from "./Toolbar";
import ImageResizer from "./ImageResizer";
import { toggleBlockType, toggleList, toggleOrderedList, insertHTML } from "./html-utils";
import { Heading1, Link2, List, ListOrdered, Quote, Trash2 } from "lucide-react";
import TableBubbleMenu from "./TableBubbleMenu";
import { handleTableTab } from "./table-utils";
import { ensureCheckboxInLi } from "./html-utils";
import { addColumn, removeColumn } from "./column-utils";
import { moveCaretToEnd } from "./caret-utils";
import { useMediaQuery, cn } from "@/lib/utils";
import { markdownToHtml, isMarkdown } from "./markdown-utils";
import TextBubbleMenu from "./TextBubbleMenu";
import SlashPopover from "./popovers/SlashPopover";
import { 
  cmdHeading1, cmdHeading2, cmdHeading3, 
  cmdListItem, cmdOrderedList, cmdChecklist,
  cmdInsertColumns, cmdInsertTable, cmdBlockquote, 
  cmdCode, cmdBold, cmdExtraBold, cmdInsertCollapsible 
} from "./commands";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

// --- LINK EDITOR POPOVER ---
const LinkEditorPopover = ({ 
  linkEl, 
  onClose, 
  onChange 
}: { 
  linkEl: HTMLAnchorElement; 
  onClose: () => void; 
  onChange: (html: string) => void 
}) => {
  const [url, setUrl] = useState(linkEl.getAttribute("href") || "");
  const [text, setText] = useState(linkEl.textContent || "");

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    linkEl.setAttribute("href", url);
    linkEl.textContent = text;
    const rte = linkEl.closest(".rte") as HTMLElement;
    onChange(rte?.innerHTML || "");
    onClose();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const parent = linkEl.parentNode;
    if (parent) {
      while (linkEl.firstChild) {
        parent.insertBefore(linkEl.firstChild, linkEl);
      }
      linkEl.remove();
      const rte = (parent as HTMLElement).closest(".rte") as HTMLElement;
      onChange(rte?.innerHTML || "");
    }
    onClose();
  };

  return (
    <div 
      className="p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700/50 flex flex-col gap-2 min-w-[260px]"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">URL</label>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(e as unknown as React.MouseEvent); }}
          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm outline-none focus:border-blue-500 transition-colors"
          autoFocus
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Display Text</label>
        <input 
          type="text" 
          value={text} 
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSave(e as unknown as React.MouseEvent); }}
          className="bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-sm outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1.5 rounded-md transition-colors"
        >
          Save
        </button>
        <button 
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleRemove}
          className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white text-xs font-bold px-2 py-1.5 rounded-md transition-all"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

// --- RICH EMPTY STATE ---
const EmptyState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
    <div className="max-w-md text-center opacity-40">
      <h3 className="text-lg font-medium text-slate-400 mb-6">Start typing to write...</h3>
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-left bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">#</code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm"><Heading1 className="w-3.5 h-3.5" /> Heading 1</div>
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">-</code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm"><List className="w-3.5 h-3.5" /> Bullet List</div>
      </div>
    </div>
  </div>
);

type Props = {
  value: string;
  onChange: (html: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [editorEl, setEditorEl] = useState<HTMLDivElement | null>(null);
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isInsideList, setIsInsideList] = useState(false);
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(true);

  // --- POPUPS & MENUS ---
  const [floatingMenu, setFloatingMenu] = useState<{ x: number; y: number } | null>(null);
  const [linkEditor, setLinkEditor] = useState<{ x: number; y: number; height: number; linkEl: HTMLAnchorElement } | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);

  // --- HISTORY MANAGEMENT ---
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isInternalChange = useRef(false);

  const saveToHistory = useCallback((html: string) => {
    if (isInternalChange.current) return;
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      if (newHistory[newHistory.length - 1] === html) return prev;
      const updated = [...newHistory, html].slice(-50);
      setHistoryIndex(updated.length - 1);
      return updated;
    });
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const html = history[prevIndex];
      isInternalChange.current = true;
      if (ref.current) { ref.current.innerHTML = html; onChange(html); }
      setHistoryIndex(prevIndex);
      setTimeout(() => { isInternalChange.current = false; }, 0);
    }
  }, [history, historyIndex, onChange]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const html = history[nextIndex];
      isInternalChange.current = true;
      if (ref.current) { ref.current.innerHTML = html; onChange(html); }
      setHistoryIndex(nextIndex);
      setTimeout(() => { isInternalChange.current = false; }, 0);
    }
  }, [history, historyIndex, onChange]);

  const executeCommand = useCallback((cmd: (ref: React.RefObject<HTMLDivElement>, onChange: (html: string) => void) => void) => {
    saveToHistory(ref.current?.innerHTML || "");
    cmd(ref as React.RefObject<HTMLDivElement>, onChange);
    setTimeout(() => { saveToHistory(ref.current?.innerHTML || ""); }, 0);
  }, [saveToHistory, onChange]);

  const safeValue = typeof value === "string" ? value : "";

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && history.length === 0 && safeValue) {
      setHistory([safeValue]);
      setHistoryIndex(0);
    }
  }, [mounted, safeValue, history.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isFocused && !isInternalChange.current) { saveToHistory(ref.current?.innerHTML || ""); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [value, isFocused, saveToHistory]);

  const isEmpty = !safeValue || safeValue === "<br>" || safeValue.trim() === "";
  const showPlaceholder = isEmpty && !isFocused;

  // --- SMOOTH DRAG & DROP LOGIC ---
  const [dragInfo, setDragInfo] = useState<{
    element: HTMLElement;
    src: string;
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const dropIndicator = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!dragInfo) return;

    const handlePointerMove = (e: PointerEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      if (!isDragging) {
        const dist = Math.hypot(e.clientX - dragInfo.startX, e.clientY - dragInfo.startY);
        if (dist > 5) {
          setIsDragging(true);
          dragInfo.element.style.opacity = "0.2";
        }
        return;
      }

      const editorEl = ref.current;
      if (!editorEl || !dropIndicator.current) return;

      const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
      if (!editorEl.contains(hoveredEl) && hoveredEl !== editorEl) {
        dropIndicator.current.style.display = "none";
        return;
      }

      let range: Range | null = null;
      if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(e.clientX, e.clientY);

      let rect: { top: number; left: number; height: number } | null = null;
      if (range && editorEl.contains(range.commonAncestorContainer)) {
        const rangeRect = range.getBoundingClientRect();
        if (rangeRect.height > 0) rect = { top: rangeRect.top, left: rangeRect.left, height: rangeRect.height };
      }

      const block = hoveredEl?.closest("li, p, h1, h2, h3, div") as HTMLElement;
      if (!rect && block && editorEl.contains(block)) {
        const blockRect = block.getBoundingClientRect();
        rect = { top: blockRect.top, left: Math.max(blockRect.left, e.clientX), height: blockRect.height };
      }

      if (rect && block?.tagName === "LI") {
        const checkbox = block.querySelector("input[type=checkbox]");
        if (checkbox) {
          const cbRect = checkbox.getBoundingClientRect();
          if (rect.left < cbRect.right + 8) rect.left = cbRect.right + 8;
        }
      }

      if (rect && rect.height > 0) {
        dropIndicator.current.style.display = "block";
        dropIndicator.current.style.top = `${rect.top}px`;
        dropIndicator.current.style.left = `${rect.left}px`;
        dropIndicator.current.style.height = `${Math.max(20, Math.min(rect.height, 40))}px`;
      } else {
        dropIndicator.current.style.display = "none";
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        let range: Range | null = null;
        if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(e.clientX, e.clientY);

        if (!range || !ref.current?.contains(range.commonAncestorContainer)) {
          const hoveredEl = document.elementFromPoint(e.clientX, e.clientY);
          const block = hoveredEl?.closest("li, p, h1, h2, h3, div") as HTMLElement;
          if (block && ref.current?.contains(block)) {
            range = document.createRange(); range.selectNodeContents(block); range.collapse(false);
          }
        }

        if (range && ref.current?.contains(range.commonAncestorContainer)) {
          if (!dragInfo.element.contains(range.commonAncestorContainer)) {
            dragInfo.element.remove();
            range.insertNode(dragInfo.element);
            if (ref.current) onChange(ref.current.innerHTML);
          }
        }
      }

      dragInfo.element.style.opacity = "1";
      setDragInfo(null);
      setIsDragging(false);
      if (dropIndicator.current) dropIndicator.current.style.display = "none";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [dragInfo, isDragging, onChange]);

  const handleImagePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".image-resizer-handle")) return;

    if (target.tagName === "IMG") {
      e.preventDefault();
      const img = target as HTMLImageElement;
      const wrapper = img.closest(".image-wrapper") as HTMLElement;
      setSelectedImg(img);
      setActiveTable(null);

      if (wrapper) {
        const rect = img.getBoundingClientRect();
        setDragInfo({
          element: wrapper,
          src: img.src,
          width: rect.width,
          height: rect.height,
          offsetX: e.clientX - rect.left,
          offsetY: e.clientY - rect.top,
          startX: e.clientX,
          startY: e.clientY,
        });
        setMousePos({ x: e.clientX, y: e.clientY });

        if (!dropIndicator.current) {
          const div = document.createElement("div");
          div.className = "fixed w-0.5 bg-blue-600 z-[9999] pointer-events-none shadow-[0_0_8px_rgba(37,99,235,0.8)] transition-all duration-75 rounded-full";
          div.style.display = "none";
          document.body.appendChild(div);
          dropIndicator.current = div;
        }
      }
    } else {
      if (!target.closest(".table-bubble-menu") && !target.closest(".image-resizer")) {
        if (selectedImg && target !== selectedImg) setSelectedImg(null);
      }
    }
  };

  // --- INIT & SYNC ---
  useEffect(() => {
    if (ref.current) {
      if (!editorEl) setEditorEl(ref.current);
      const currentValue = typeof value === "string" ? value : "";
      if (ref.current.innerHTML !== currentValue) {
        const currentFocus = document.activeElement;
        const isActive = currentFocus === ref.current || (ref.current && ref.current.contains(currentFocus));
        if (!isActive) ref.current.innerHTML = currentValue;
      }
    }
  }, [value, editorEl]);

  const [sectionMenu, setSectionMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  // Close section menu on click outside
  useEffect(() => {
    if (!sectionMenu) return;
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".section-menu-popover") && !target.closest(".btn-section-more")) {
        setSectionMenu(null);
      }
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, [sectionMenu]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    // --- JUMP LINK LOGIC ---
    const jumpBtn = target.closest(".section-jump-btn") as HTMLElement;
    if (jumpBtn) {
      const targetId = jumpBtn.getAttribute("data-target");
      if (targetId) {
        e.preventDefault();
        e.stopPropagation();
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          targetEl.classList.add("section-highlight");
          setTimeout(() => targetEl.classList.remove("section-highlight"), 2000);
          
          // Manually set focus/selection inside the button if needed, 
          // but browser default click usually handles this.
        }
      }
      return;
    }

    // --- CHECKBOX LOGIC ---
    if (target.tagName === "INPUT" && (target as HTMLInputElement).type === "checkbox") {
      e.stopPropagation();
      const checkbox = target as HTMLInputElement;
      if (checkbox.checked) checkbox.setAttribute("checked", "true");
      else checkbox.removeAttribute("checked");
      if (ref.current) onChange(ref.current.innerHTML);
      return;
    }

    // --- COLLAPSIBLE SECTION LOGIC ---
    const summary = target.closest("summary");
    if (summary) {
      const toggleArea = target.closest(".section-toggle-area");
      const details = summary.parentElement as HTMLDetailsElement;
      const moreBtn = target.closest(".btn-section-more") as HTMLButtonElement;

      if (toggleArea) {
        // Toggle the open state only if arrow is clicked
        e.preventDefault();
        e.stopPropagation();
        const isOpen = details.hasAttribute("open");
        if (isOpen) details.removeAttribute("open");
        else details.setAttribute("open", "");
        
        if (ref.current) onChange(ref.current.innerHTML);
      } else if (moreBtn) {
        // Handle more button click (Popover)
        e.preventDefault();
        e.stopPropagation();
        
        const sectionId = moreBtn.getAttribute("data-section-id") || "";
        
        // TOGGLE: If same menu is already open, close it
        if (sectionMenu && sectionMenu.id === sectionId) {
          setSectionMenu(null);
          return;
        }

        const rect = moreBtn.getBoundingClientRect();
        const editorRect = ref.current?.getBoundingClientRect();
        
        if (editorRect) {
          const popoverWidth = 192; // w-48 is 12rem = 192px
          let x = rect.left - editorRect.left;
          
          // Check if popover would overflow right side of screen
          if (rect.left + popoverWidth > window.innerWidth - 16) {
            // Shift left: align right edge of popover with right edge of button
            x = (rect.right - editorRect.left) - popoverWidth;
          }

          setSectionMenu({
            id: sectionId,
            x: x,
            y: rect.bottom - editorRect.top
          });
        }
      } else {
        // ALWAYS prevent default on summary to stop browser-native toggle
        // This allows clicking the title to focus it without the section collapsing/expanding.
        e.preventDefault();
      }
      return;
    }

    // --- COLUMN LOGIC ---
    const columnContainer = target.closest(".rte-columns") as HTMLElement;
    if (columnContainer) {
      if (target.classList.contains("add-column-btn")) {
        e.preventDefault(); e.stopPropagation(); addColumn(columnContainer);
        if (ref.current) onChange(ref.current.innerHTML);
      } else if (target.classList.contains("remove-column-btn")) {
        e.preventDefault(); e.stopPropagation(); removeColumn(columnContainer);
        if (ref.current) onChange(ref.current.innerHTML);
      }
    }

    // --- TABLE SELECTION LOGIC ---
    const table = target.closest("table");
    if (table) {
      setActiveTable(table as HTMLTableElement);
    } else {
      setActiveTable(null);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const anchor = sel.anchorNode;
      const element = (anchor?.nodeType === 3 ? anchor.parentElement : anchor) as HTMLElement;
      const li = element?.closest("li");
      if (li) {
        const ul = li.closest("ul");
        if (ul && ul.classList.contains("task-list")) {
          ensureCheckboxInLi(li); moveCaretToEnd(li as HTMLElement);
          if (ref.current) onChange(ref.current.innerHTML);
        }
      }
    }
  };

  const [slashMenu, setSlashMenu] = useState<{ x: number; y: number; filter: string; placement: "top" | "bottom"; } | null>(null);
  const handleSelectSlashAction = (action: string) => {
    if (!slashMenu) return;
    ref.current?.focus();
    const lengthToDelete = slashMenu.filter.length + 1;
    for (let i = 0; i < lengthToDelete; i++) document.execCommand("delete", false);
    switch (action) {
      case "h1": executeCommand(cmdHeading1); break;
      case "h2": executeCommand(cmdHeading2); break;
      case "h3": executeCommand(cmdHeading3); break;
      case "bullet": executeCommand(cmdListItem); break;
      case "number": executeCommand(cmdOrderedList); break;
      case "todo": executeCommand(cmdChecklist); break;
      case "collapsible": executeCommand(cmdInsertCollapsible); break;
      case "columns": executeCommand(cmdInsertColumns); break;
      case "table": executeCommand(cmdInsertTable); break;
      case "quote": executeCommand(cmdBlockquote); break;
      case "code": executeCommand(cmdCode); break;
      case "bold": executeCommand(cmdBold); break;
      case "extrabold": executeCommand(cmdExtraBold); break;
    }
    setSlashMenu(null);
  };

  // --- AUTO-SCROLL TO HASH ---
  useEffect(() => {
    if (mounted && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash.startsWith("section-")) {
        // Wait a bit for the content to fully render
        setTimeout(() => {
          const targetEl = document.getElementById(hash);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
            targetEl.classList.add("section-highlight");
            setTimeout(() => targetEl.classList.remove("section-highlight"), 2000);
          }
        }, 500);
      }
    }
  }, [mounted]);

  useEffect(() => {
    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => {
      setIsMouseDown(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      // Check if focus is inside the Link Editor Popover - if so, don't close it!
      const activeEl = document.activeElement;
      if (activeEl?.closest(".link-editor-popover-container")) {
        return;
      }

      if (isMouseDown) return;

      const sel = window.getSelection();
      if (!sel || !ref.current?.contains(sel.anchorNode)) {
        setFloatingMenu(null);
        setLinkEditor(null);
        return;
      }

      // 1. Detect if we are inside or blocking a link (<a>)
      let linkEl: HTMLAnchorElement | null = null;
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
      
      if (range) {
        let node: Node | null = sel.anchorNode;
        if (node?.nodeType === 3) node = node.parentElement;
        linkEl = (node as HTMLElement)?.closest("a");

        if (!linkEl && !sel.isCollapsed) {
          let common = range.commonAncestorContainer;
          if (common.nodeType === 3) common = common.parentElement!;
          linkEl = (common as HTMLElement).closest("a");
        }
      }

      // Check if it's a standard link (not jump btn)
      if (linkEl && ref.current.contains(linkEl) && !linkEl.classList.contains("section-jump-btn")) {
        const rect = linkEl.getBoundingClientRect();
        setLinkEditor({
          x: rect.left + rect.width / 2,
          y: rect.bottom, 
          height: rect.height,
          linkEl: linkEl as HTMLAnchorElement
        });
        setFloatingMenu(null);
        return;
      } else {
        setLinkEditor(null);
      }

      // 2. Standard Floating Menu for blocked text
      if (sel.isCollapsed) {
        setFloatingMenu(null);
        return;
      }

      const anchorParent = sel.anchorNode?.parentElement;
      setIsInsideList(!!anchorParent?.closest("li"));
      const rects = range?.getClientRects();
      if (!rects || rects.length === 0) return;
      const firstRect = rects[0]; 
      const editorRect = ref.current?.getBoundingClientRect();
      if (editorRect) {
        let x = firstRect.left - editorRect.left + firstRect.width / 2;
        const y = firstRect.top - editorRect.top;
        const buffer = Math.min(isMobile ? 140 : 230, editorRect.width / 2);
        if (x < buffer) x = buffer; if (x > editorRect.width - buffer) x = editorRect.width - buffer;
        setFloatingMenu({ x, y });
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [isMobile, isMouseDown]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Backspace") {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed) {
        const node = sel.anchorNode;
        const parent = (node?.nodeType === 3 ? node.parentElement : node) as HTMLElement;
        
        // Handle Backspace in empty Section Title
        const title = parent?.closest(".section-title") as HTMLElement;
        if (title && title.textContent?.trim() === "") {
          e.preventDefault();
          const details = title.closest("details");
          if (details) {
            details.remove();
            if (ref.current) onChange(ref.current.innerHTML);
          }
          return;
        }

        const col = parent?.closest(".rte-column") as HTMLElement;
        if (col) {
          const isEmpty = col.innerText.trim() === "" && col.querySelectorAll("img, table").length === 0;
          if (isEmpty) {
            e.preventDefault(); const wrapper = col.closest(".rte-columns") as HTMLElement;
            if (wrapper) { removeColumn(wrapper); if (ref.current) onChange(ref.current.innerHTML); }
            return;
          }
        }
      }
    }
    if (e.key === "/") {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed) {
        const range = sel.getRangeAt(0); const rects = range.getClientRects();
        const editorRect = ref.current?.getBoundingClientRect();
        if (editorRect) {
          const rect: DOMRect = rects.length > 0 ? rects[0] : (() => {
            const span = document.createElement("span"); span.textContent = "\u200b";
            range.insertNode(span); const r = span.getBoundingClientRect(); span.remove(); return r;
          })();
          const spaceBelow = window.innerHeight - rect.bottom;
          const placement = spaceBelow < 300 ? "top" : "bottom";
          setSlashMenu({ x: rect.left - editorRect.left, y: rect.top - editorRect.top + (placement === "bottom" ? rect.height : 0), filter: "", placement });
        }
      }
    }
    if (slashMenu && e.key.length === 1 && e.key !== "/") setSlashMenu(prev => prev ? { ...prev, filter: prev.filter + e.key } : null);
    if (slashMenu && e.key === "Backspace") { if (slashMenu.filter === "") setSlashMenu(null); else setSlashMenu(prev => prev ? { ...prev, filter: prev.filter.slice(0, -1) } : null); }
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (e.key === "y") { e.preventDefault(); redo(); return; }
    }
    if (e.key === "Tab") {
      const sel = window.getSelection(); const node = sel?.anchorNode;
      const element = (node?.nodeType === 3 ? node.parentElement : node) as HTMLElement;
      const cell = element?.closest("td, th");
      if (cell && cell instanceof HTMLElement) { handleTableTab(e, cell); onChange(ref.current?.innerHTML || ""); return; }
      const li = element?.closest("li");
      if (li) { e.preventDefault(); if (e.shiftKey) document.execCommand("outdent"); else document.execCommand("indent"); onChange(ref.current?.innerHTML || ""); return; }
    }
    if (e.key === " ") {
      const sel = window.getSelection(); if (!sel || !sel.isCollapsed) return;
      const anchorNode = sel.anchorNode;
      if (anchorNode?.nodeType === 3 && anchorNode.parentElement) {
        const textBeforeCaret = anchorNode.textContent?.slice(0, sel.anchorOffset) || "";
        const trimmedText = textBeforeCaret.trim();
        const triggerToggle = (type: string | (() => void)) => {
          e.preventDefault(); const range = document.createRange();
          const startPos = textBeforeCaret.lastIndexOf(trimmedText);
          range.setStart(anchorNode, startPos); range.setEnd(anchorNode, sel.anchorOffset);
          range.deleteContents();
          if (typeof type === "function") type(); else toggleBlockType(type);
          onChange(ref.current?.innerHTML || "");
        };
        if (trimmedText === "1.") { triggerToggle(toggleOrderedList); return; }
        if (trimmedText === "-" || trimmedText === "*") { triggerToggle(toggleList); return; }
        if (trimmedText === "#") { triggerToggle("h1"); return; }
        if (trimmedText === "##") { triggerToggle("h2"); return; }
        if (trimmedText === "###") { triggerToggle("h3"); return; }
        if (trimmedText === ">") { triggerToggle("blockquote"); return; }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text/plain");

    // --- DETECT SECTION LINK FOR TRANSFORMATION ---
    try {
      const url = new URL(text);
      if (url.origin === window.location.origin && 
          url.pathname === window.location.pathname && 
          url.hash.startsWith("#section-")) {
        
        e.preventDefault();
        const sectionId = url.hash.substring(1);
        const targetEl = document.getElementById(sectionId);
        const titleEl = targetEl?.querySelector(".section-title");
        const titleText = titleEl?.textContent?.trim() || "Section";

        const btnHtml = `<span class="section-jump-btn" data-target="${sectionId}">#${titleText}</span>&nbsp;`;
        insertHTML(btnHtml);
        if (ref.current) onChange(ref.current.innerHTML);
        return;
      }
    } catch (err) {
      // Not a valid URL, continue with normal paste
    }

    if (isMarkdown(text)) {
      e.preventDefault(); const html = markdownToHtml(text); insertHTML(html);
      if (ref.current) onChange(ref.current.innerHTML);
    }
  };

  return (
    <div className="relative w-full group min-h-[60vh]">
      {/* DRAG PREVIEW */}
      <AnimatePresence>
        {isDragging && dragInfo && createPortal(
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.95, x: mousePos.x - dragInfo.offsetX, y: mousePos.y - dragInfo.offsetY }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 600, damping: 35, mass: 0.1 }}
            className="fixed z-[999999] pointer-events-none overflow-hidden rounded-xl shadow-2xl border-2 border-blue-500 bg-white"
            style={{ width: dragInfo.width, height: dragInfo.height, left: 0, top: 0 }}
          >
            <img src={dragInfo.src} className="w-full h-full object-contain" alt="Preview" />
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      <div className="sticky -top-[1.48rem] z-[100] bg-white/80 backdrop-blur-md border-b mb-4 -mx-2 px-2 py-1">
        {editorEl && (
          <Toolbar 
            refEl={editorEl} onChange={onChange} 
            spellCheckEnabled={spellCheckEnabled}
            onToggleSpellCheck={() => setSpellCheckEnabled(!spellCheckEnabled)}
            undo={undo} redo={redo} onExecute={executeCommand}
          />
        )}
      </div>

      {slashMenu && createPortal(
        <div className={cn("absolute z-[2000] pointer-events-auto animate-in fade-in zoom-in duration-200", slashMenu.placement === "top" ? "-translate-y-full slide-in-from-bottom-2" : "slide-in-from-top-2")}
          style={{ left: slashMenu.x + (ref.current?.getBoundingClientRect().left || 0), top: slashMenu.y + (ref.current?.getBoundingClientRect().top || 0) + (slashMenu.placement === "bottom" ? 10 : -10) }}>
          <SlashPopover filter={slashMenu.filter} onSelect={handleSelectSlashAction} onClose={() => setSlashMenu(null)} />
        </div>, document.body
      )}

      {floatingMenu && (
        <div className="absolute z-[1000] -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in duration-200"
          style={{ left: floatingMenu.x, top: floatingMenu.y, marginTop: "2px" }}>
          <TextBubbleMenu editorRef={ref as React.RefObject<HTMLDivElement>} onChange={onChange} onClose={() => setFloatingMenu(null)} isList={isInsideList} />
        </div>
      )}

      {linkEditor && createPortal(
        <div 
          className="link-editor-popover-container fixed z-[2000] -translate-x-1/2 animate-in fade-in zoom-in duration-200"
          style={{ 
            left: linkEditor.x, 
            top: linkEditor.y + 10 
          }}
        >
          <LinkEditorPopover linkEl={linkEditor.linkEl} onClose={() => setLinkEditor(null)} onChange={onChange} />
        </div>,
        document.body
      )}

      <ImageResizer editorRef={ref as React.RefObject<HTMLDivElement>} selectedImage={selectedImg} setSelectedImage={setSelectedImg} onResizeEnd={() => { if (ref.current) onChange(ref.current.innerHTML); }} />

      {activeTable && (
        <div style={{ position: "absolute", top: activeTable.offsetTop, left: activeTable.offsetLeft }} className="w-full pointer-events-none">
          <div className="pointer-events-auto w-fit">
            <TableBubbleMenu tableEl={activeTable} onUpdate={() => { if (ref.current) onChange(ref.current.innerHTML); if (!document.contains(activeTable)) setActiveTable(null); }} />
          </div>
        </div>
      )}

      {/* SECTION MENU POPOVER */}
      {sectionMenu && createPortal(
        <div 
          className="section-menu-popover"
          style={{ 
            left: sectionMenu.x + (ref.current?.getBoundingClientRect().left || 0), 
            top: sectionMenu.y + (ref.current?.getBoundingClientRect().top || 0) 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            className="section-menu-item"
            onClick={() => {
              const url = new URL(window.location.href);
              url.hash = sectionMenu.id;
              navigator.clipboard.writeText(url.toString());
              setSectionMenu(null);
            }}
          >
            <Link2 className="w-3.5 h-3.5" />
            Copy Link to Section
          </button>
          <button 
            className="section-menu-item text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            onClick={() => {
              const el = document.getElementById(sectionMenu.id);
              if (el) {
                el.remove();
                if (ref.current) onChange(ref.current.innerHTML);
              }
              setSectionMenu(null);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete section
          </button>
        </div>,
        document.body
      )}

      {showPlaceholder && <EmptyState />}

      <div
        ref={ref}
        contentEditable
        spellCheck={spellCheckEnabled}
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onPointerDown={handleImagePointerDown}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={(e) => {
          const target = e.target as HTMLElement;
          if (target.tagName === "INPUT") return;

          // Clean up empty jump buttons
          const emptyBtns = target.querySelectorAll(".section-jump-btn");
          emptyBtns.forEach(btn => {
            if (btn.textContent?.trim() === "") {
              btn.remove();
            }
          });

          // Clean up sections with empty titles
          const titles = target.querySelectorAll(".section-title");
          titles.forEach(title => {
            const text = title.textContent?.trim() || "";
            // If title is empty (and not just currently being edited to empty with a placeholder)
            // Actually, the user wants it deleted IF it's empty.
            // We should check if the user just deleted the last character.
            if (text === "") {
              const details = title.closest("details");
              if (details) {
                // To avoid losing focus entirely, we can insert a paragraph before/after or just remove
                details.remove();
              }
            }
          });

          const html = (ref.current as HTMLDivElement).innerHTML;
          const cleanHtml = html === "<br>" ? "" : html;
          const currentValue = typeof value === "string" ? value : "";
          if (cleanHtml !== currentValue) onChange(cleanHtml);
        }}
        className="
            rte w-full outline-none text-slate-700 leading-relaxed pb-20 relative z-10 px-2
            [&_.text-left]:text-left [&_.text-center]:text-center [&_.text-right]:text-right [&_.text-justify]:text-justify
            [&_p.text-center]:text-center [&_h1.text-center]:text-center [&_h2.text-center]:text-center [&_h3.text-center]:text-center [&_blockquote.text-center]:text-center
            [&_p.text-right]:text-right [&_h1.text-right]:text-right [&_h2.text-right]:text-right [&_h3.text-right]:text-right [&_blockquote.text-right]:text-right
            [&_p.text-justify]:text-justify [&_h1.text-justify]:text-justify [&_h2.text-justify]:text-justify [&_h3.text-justify]:text-justify [&_blockquote.text-justify]:text-justify
            [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:block [&_h1]:!leading-tight
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:block
            [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:block
            [&_hr]:my-6 [&_hr]:border-slate-200
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-slate-50 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:rounded-r
            [&_ul.task-list]:list-none [&_ul.task-list]:pl-0
            [&_ul.task-list_li]:flex [&_ul.task-list_li]:items-start [&_ul.task-list_li]:gap-3 [&_ul.task-list_li]:mb-2
            [&_input[type=checkbox]]:appearance-none [&_input[type=checkbox]]:shrink-0 [&_input[type=checkbox]]:h-5 [&_input[type=checkbox]]:w-5 [&_input[type=checkbox]]:cursor-pointer [&_input[type=checkbox]]:rounded-md [&_input[type=checkbox]]:border-2 [&_input[type=checkbox]]:border-slate-300 [&_input[type=checkbox]]:bg-white [&_input[type=checkbox]]:transition-all [&_input[type=checkbox]]:mt-1
            [&_input[type=checkbox]:checked]:bg-slate-900 [&_input[type=checkbox]:checked]:border-slate-900 [&_input[type=checkbox]:checked]:bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%2F%3E%3C%2Fsvg%3E')] [&_input[type=checkbox]:checked]:bg-[length:14px_14px] [&_input[type=checkbox]:checked]:bg-center [&_input[type=checkbox]:checked]:bg-no-repeat
            [&_li:has(input:checked)]:text-slate-400 [&_li:has(input:checked)]:line-through decoration-slate-400
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_li]:pl-1 [&_li]:mb-1
            [&_code]:font-mono [&_code]:text-sm [&_code]:bg-slate-100 [&_code]:text-red-500 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-slate-200
            [&_img]:cursor-pointer [&_img]:border-2 [&_img]:border-transparent [&_img:hover]:border-blue-200 [&_img]:transition-colors
            [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer [&_a:hover]:text-blue-800
            [&_.font-black]:font-black [&_.font-black]:text-slate-900
            [&_table]:border-collapse [&_table]:border-spacing-0 [&_table]:my-4
            [&_th]:bg-slate-50 [&_th]:font-semibold [&_th]:text-left
            [&_td,&_th]:border [&_td,&_th]:border-slate-300 [&_td,&_th]:p-2 [&_td,&_th]:min-w-[50px]
        "
      />
    </div>
  );
}
