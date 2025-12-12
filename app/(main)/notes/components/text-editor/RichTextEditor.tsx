"use client";

import { useRef, useEffect, useState } from "react";
import Toolbar from "./Toolbar";
import ImageResizer from "./ImageResizer";
import { toggleBlockType, toggleList, toggleOrderedList } from "./html-utils";
import { Heading1, List, ListOrdered, Quote } from "lucide-react";
import TableBubbleMenu from "./TableBubbleMenu";
import { handleTableTab } from "./table-utils";
import { ensureCheckboxInLi } from "./html-utils";
import { moveCaretToEnd } from "./caret-utils";

// --- [UPDATED] RICH EMPTY STATE ---
const EmptyState = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
    <div className="max-w-md text-center opacity-40">
      <h3 className="text-lg font-medium text-slate-400 mb-6">
        Start typing to write...
      </h3>

      {/* SHORTCUTS GUIDE GRID */}
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-left bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 backdrop-blur-sm">
        {/* Heading Shortcut */}
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
            #
          </code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Heading1 className="w-3.5 h-3.5" /> Heading 1
        </div>

        {/* Bullet List Shortcut */}
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
            -
          </code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <List className="w-3.5 h-3.5" /> Bullet List
        </div>

        {/* Numbered List Shortcut */}
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
            1.
          </code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <ListOrdered className="w-3.5 h-3.5" /> Numbered List
        </div>

        {/* Blockquote Shortcut */}
        <div className="flex items-center justify-end">
          <code className="font-mono text-xs bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded border border-slate-300">
            &gt;
          </code>
          <span className="text-xs text-slate-400 ml-1">+ space</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Quote className="w-3.5 h-3.5" /> Quote
        </div>
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

  // State untuk active table menu
  const [activeTable, setActiveTable] = useState<HTMLTableElement | null>(null);

  // State untuk tracking focus & content (Empty State Logic)
  const [isFocused, setIsFocused] = useState(false);

  // Cek apakah konten kosong (handle kasus HTML sisaan spasi/break)
  const isEmpty = !value || value === "<br>" || value.trim() === "";
  const showPlaceholder = isEmpty && !isFocused;

  // --- HANDLERS (Image, Link, & TABLE) ---
  useEffect(() => {
    if (!editorEl) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // 1. Logic Image
      if (target.tagName === "IMG") {
        e.preventDefault();
        setSelectedImg(target as HTMLImageElement);
        setActiveTable(null); // Reset table selection
      }
      // 2. Logic Table
      else if (target.closest("table")) {
        // Jangan preventDefault biar bisa ngetik di sel
        const table = target.closest("table") as HTMLTableElement;
        setActiveTable(table);
        setSelectedImg(null); // Reset img selection
      }
      // 3. Click elsewhere
      else {
        if (selectedImg && target !== selectedImg) setSelectedImg(null);
        // Cek jika klik diluar tabel, hilangkan menu tabel
        if (activeTable && !target.closest("table")) setActiveTable(null);
      }
    };

    editorEl.addEventListener("mousedown", handleMouseDown);
    return () => editorEl.removeEventListener("mousedown", handleMouseDown);
  }, [editorEl, selectedImg, activeTable]);

  // Handler Link Click
  useEffect(() => {
    if (!editorEl) return;
    let downTarget: HTMLElement | null = null;
    const handleMouseDown = (e: MouseEvent) => {
      downTarget = e.target as HTMLElement;
    };
    const handleMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName !== "A") return;
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) return;
      if (downTarget !== target) return;
      e.preventDefault();
      window.open(target.getAttribute("href") || "#", "_blank");
    };
    editorEl.addEventListener("mousedown", handleMouseDown);
    editorEl.addEventListener("mouseup", handleMouseUp);
    return () => {
      editorEl.removeEventListener("mousedown", handleMouseDown);
      editorEl.removeEventListener("mouseup", handleMouseUp);
    };
  }, [editorEl]);

  // --- INIT & SYNC ---
  useEffect(() => {
    if (ref.current) {
      if (!editorEl) setEditorEl(ref.current);
      if (ref.current.innerHTML !== value) {
        // [FIX UTAMA: LOGIC FOCUS]
        // Cek apakah user sedang fokus di editor ATAU di element anak (checkbox/input)
        const currentFocus = document.activeElement;
        const isActive =
          currentFocus === ref.current ||
          (ref.current && ref.current.contains(currentFocus));

        // Jika fokus ada di dalam editor (termasuk checkbox), JANGAN timpa HTML
        if (!isActive) {
          ref.current.innerHTML = value;
        }
      }
    }
  }, [value, editorEl]);

  // --- [PERBAIKAN] HANDLER KLIK CHECKBOX ---
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Cek jika yang diklik adalah Checkbox di dalam editor
    if (
      target.tagName === "INPUT" &&
      (target as HTMLInputElement).type === "checkbox"
    ) {
      // [FIX] Stop propagasi agar tidak dianggap click editor biasa yang mereset seleksi
      e.stopPropagation();

      const checkbox = target as HTMLInputElement;

      // [FIX] Update atribut DOM agar tersimpan di string HTML
      if (checkbox.checked) {
        checkbox.setAttribute("checked", "true");
      } else {
        checkbox.removeAttribute("checked");
      }

      // PENTING: Trigger onChange manual agar parent tau HTML berubah
      if (ref.current) onChange(ref.current.innerHTML);
    }
  };

  // --- HANDLER ENTER PADA CHECKLIST ---
  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const anchor = sel.anchorNode;
      // [FIX TS] Pastikan anchor diperlakukan sebagai HTMLElement
      const element = (
        anchor?.nodeType === 3 ? anchor.parentElement : anchor
      ) as HTMLElement;

      const li = element?.closest("li");

      if (li) {
        const ul = li.closest("ul");
        // Cek apakah ini task-list
        if (ul && ul.classList.contains("task-list")) {
          // Pastikan LI baru punya checkbox
          ensureCheckboxInLi(li);

          // [FIX] Pindahkan kursor ke kanan checkbox di baris baru
          moveCaretToEnd(li as HTMLElement);

          // Trigger save
          if (ref.current) onChange(ref.current.innerHTML);
        }
      }
    }
  };

  // --- MARKDOWN SHORTCUTS & TABLE TAB HANDLER ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. DETEKSI TAB DI DALAM TABLE
    if (e.key === "Tab") {
      const sel = window.getSelection();
      const node = sel?.anchorNode;
      // [FIX TS] Pastikan node diperlakukan sebagai HTMLElement
      const element = (
        node?.nodeType === 3 ? node.parentElement : node
      ) as HTMLElement;

      const cell = element?.closest("td, th");

      if (cell && cell instanceof HTMLElement) {
        handleTableTab(e, cell);
        onChange(ref.current?.innerHTML || "");
        return;
      }
    }

    // 2. MARKDOWN SHORTCUTS (Space Trigger)
    if (e.key === " ") {
      const sel = window.getSelection();
      if (!sel || !sel.isCollapsed) return;

      const anchorNode = sel.anchorNode;
      if (anchorNode?.nodeType === 3 && anchorNode.parentElement) {
        const text = anchorNode.textContent || "";

        // 1. ORDERED LIST ("1. " -> <ol>)
        if (text.trim() === "1.") {
          e.preventDefault();
          const range = document.createRange();
          range.selectNodeContents(anchorNode);
          range.deleteContents();
          toggleOrderedList();
          onChange(ref.current?.innerHTML || "");
          return;
        }

        // 2. UNORDERED LIST ("- " or "* " -> <ul>)
        if (text.trim() === "-" || text.trim() === "*") {
          e.preventDefault();
          const range = document.createRange();
          range.selectNodeContents(anchorNode);
          range.deleteContents();
          toggleList();
          onChange(ref.current?.innerHTML || "");
          return;
        }

        // 3. HEADING 1 ("# " -> <h1>)
        if (text.trim() === "#") {
          e.preventDefault();
          const range = document.createRange();
          range.selectNodeContents(anchorNode);
          range.deleteContents();
          toggleBlockType("h1");
          onChange(ref.current?.innerHTML || "");
          return;
        }

        // 4. BLOCKQUOTE ("> " -> <blockquote>)
        if (text.trim() === ">") {
          e.preventDefault();
          const range = document.createRange();
          range.selectNodeContents(anchorNode);
          range.deleteContents();
          toggleBlockType("blockquote");
          onChange(ref.current?.innerHTML || "");
          return;
        }
      }
    }
  };

  return (
    <div className="relative w-full group min-h-[60vh]">
      {editorEl && <Toolbar refEl={editorEl} onChange={onChange} />}

      <ImageResizer
        // [FIX TS] Casting RefObject agar sesuai ekspektasi ImageResizer
        editorRef={ref as React.RefObject<HTMLDivElement>}
        selectedImage={selectedImg}
        setSelectedImage={setSelectedImg}
        onResizeEnd={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
      />

      {/* RENDER TABLE MENU */}
      {activeTable && (
        <div
          style={{
            position: "absolute",
            top: activeTable.offsetTop,
            left: activeTable.offsetLeft,
          }}
          className="w-full pointer-events-none"
        >
          <div className="pointer-events-auto w-fit">
            <TableBubbleMenu
              tableEl={activeTable}
              onUpdate={() => {
                if (ref.current) onChange(ref.current.innerHTML);
                if (!document.contains(activeTable)) setActiveTable(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Placeholder logic */}
      {showPlaceholder && <EmptyState />}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        // [PERBAIKAN] Pasang handler Click & KeyUp untuk Checklist
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onInput={(e) => {
          const html = (e.target as HTMLDivElement).innerHTML;
          const cleanHtml = html === "<br>" ? "" : html;
          if (cleanHtml !== value) onChange(cleanHtml);
        }}
        className="
            rte w-full outline-none text-slate-700 leading-relaxed pb-20 relative z-10 px-2
            
            /* --- TYPOGRAPHY STYLES --- */
            [&_.text-left]:text-left [&_.text-center]:text-center [&_.text-right]:text-right [&_.text-justify]:text-justify
            [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:text-slate-900 [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:block [&_h1]:!leading-tight
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-slate-50 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:my-4 [&_blockquote]:italic [&_blockquote]:text-slate-600 [&_blockquote]:rounded-r
            
            /* --- [NEW] MODERN CHECKBOX STYLES --- */
            /* 1. Container Flex & Alignment */
            [&_ul.task-list]:list-none [&_ul.task-list]:pl-0
            [&_ul.task-list_li]:flex [&_ul.task-list_li]:items-start [&_ul.task-list_li]:gap-3 [&_ul.task-list_li]:mb-2
            
            /* 2. Checkbox Customization (Hapus default browser style) */
            [&_input[type=checkbox]]:appearance-none 
            [&_input[type=checkbox]]:shrink-0 
            [&_input[type=checkbox]]:h-5 [&_input[type=checkbox]]:w-5 
            [&_input[type=checkbox]]:cursor-pointer 
            [&_input[type=checkbox]]:rounded-md 
            [&_input[type=checkbox]]:border-2 [&_input[type=checkbox]]:border-slate-300 
            [&_input[type=checkbox]]:bg-white 
            [&_input[type=checkbox]]:transition-all
            [&_input[type=checkbox]]:mt-1 /* Alignment trick agar rata tengah dengan baris pertama teks */

            /* 3. Checkbox Checked State (Background Hitam & Icon) */
            [&_input[type=checkbox]:checked]:bg-slate-900 
            [&_input[type=checkbox]:checked]:border-slate-900
            [&_input[type=checkbox]:checked]:bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%2220%206%209%2017%204%2012%22%2F%3E%3C%2Fsvg%3E')]
            [&_input[type=checkbox]:checked]:bg-[length:14px_14px] 
            [&_input[type=checkbox]:checked]:bg-center 
            [&_input[type=checkbox]:checked]:bg-no-repeat

            /* 4. Teks yang sudah dicentang (Strikethrough visual) */
            [&_li:has(input:checked)]:text-slate-400 
            [&_li:has(input:checked)]:line-through decoration-slate-400

            /* --- Styles lain (Code, Img, Link, Table) --- */
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_li]:pl-1 [&_li]:mb-1
            
            [&_code]:font-mono [&_code]:text-sm [&_code]:bg-slate-100 [&_code]:text-red-500 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:border [&_code]:border-slate-200
            [&_img]:cursor-pointer [&_img]:border-2 [&_img]:border-transparent [&_img:hover]:border-blue-200 [&_img]:transition-colors
            [&_a]:text-blue-600 [&_a]:underline [&_a]:cursor-pointer [&_a:hover]:text-blue-800

            [&_table]:border-collapse [&_table]:border-spacing-0 [&_table]:my-4
            [&_th]:bg-slate-50 [&_th]:font-semibold [&_th]:text-left
            [&_td,&_th]:border [&_td,&_th]:border-slate-300 [&_td,&_th]:p-2 [&_td,&_th]:min-w-[50px]
        "
      />
    </div>
  );
}
