// app/(main)/notes/components/text-editor/commands.ts
import { RefObject } from "react"; // [FIX] Import RefObject
import { 
  toggleFormat, toggleBlockType, toggleBlockClass, toggleList, toggleOrderedList, insertHTML, toggleCode, 
  toggleTextColor,
  toggleHighlight,
  toggleCheckList,
  toggleExtraBold,
  isInColumn
} from "./html-utils";
import { createColumns } from "./column-utils";

// [FIX] Definisikan tipe agar tidak perlu ditulis berulang-ulang
type EditorRef = RefObject<HTMLDivElement>;
type OnChangeFn = (html: string) => void;

// ... (Bold, Italic, Underline)
export const cmdBold = (ref: EditorRef, onChange: OnChangeFn) => { toggleFormat("bold"); onChange(ref.current?.innerHTML || ""); };
export const cmdExtraBold = (ref: EditorRef, onChange: OnChangeFn) => { toggleExtraBold(); onChange(ref.current?.innerHTML || ""); };
export const cmdItalic = (ref: EditorRef, onChange: OnChangeFn) => { toggleFormat("italic"); onChange(ref.current?.innerHTML || ""); };
export const cmdUnderline = (ref: EditorRef, onChange: OnChangeFn) => { toggleFormat("underline"); onChange(ref.current?.innerHTML || ""); };

// --- HISTORY ---
export const cmdUndo = (ref: EditorRef, onChange: OnChangeFn) => { document.execCommand("undo"); onChange(ref.current?.innerHTML || ""); };
export const cmdRedo = (ref: EditorRef, onChange: OnChangeFn) => { document.execCommand("redo"); onChange(ref.current?.innerHTML || ""); };

// --- CODE ---
export const cmdCode = (ref: EditorRef, onChange: OnChangeFn, forceBlock: boolean = false) => {
  toggleCode(forceBlock); 
  onChange(ref.current?.innerHTML || "");
};

// ... BLOCKS ---
export const cmdHeading1 = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockType("h1"); onChange(ref.current?.innerHTML || ""); };
export const cmdHeading2 = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockType("h2"); onChange(ref.current?.innerHTML || ""); };
export const cmdHeading3 = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockType("h3"); onChange(ref.current?.innerHTML || ""); };
export const cmdBlockquote = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockType("blockquote"); onChange(ref.current?.innerHTML || ""); };

export const cmdListItem = (ref: EditorRef, onChange: OnChangeFn) => { toggleList(); onChange(ref.current?.innerHTML || ""); };
export const cmdOrderedList = (ref: EditorRef, onChange: OnChangeFn) => { toggleOrderedList(); onChange(ref.current?.innerHTML || ""); };

// --- ALIGNMENT ---
const ALIGN_CLASSES = ["text-left", "text-center", "text-right", "text-justify"];

export const cmdAlignLeft = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockClass("text-left", ALIGN_CLASSES); onChange(ref.current?.innerHTML || ""); };
export const cmdAlignCenter = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockClass("text-center", ALIGN_CLASSES); onChange(ref.current?.innerHTML || ""); };
export const cmdAlignRight = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockClass("text-right", ALIGN_CLASSES); onChange(ref.current?.innerHTML || ""); };
export const cmdAlignJustify = (ref: EditorRef, onChange: OnChangeFn) => { toggleBlockClass("text-justify", ALIGN_CLASSES); onChange(ref.current?.innerHTML || ""); };

// --- INSERTS ---
export const cmdLink = (ref: EditorRef, onChange: OnChangeFn, alias: string, url: string) => {
  const html = `<a href="${url}" class="text-blue-500 underline" target="_blank">${alias}</a>`;
  insertHTML(html);
  onChange(ref.current?.innerHTML || "");
};

export const cmdImage = (ref: EditorRef, onChange: OnChangeFn, url: string) => {
  const html = `
    <div class="my-3 w-full flex justify-center image-wrapper" draggable="false">
      <img src="${url}" 
           class="max-w-full rounded-lg block object-contain shadow-sm draggable-image cursor-grab active:cursor-grabbing" 
           style="width: 90%;" 
           draggable="false" />
    </div>
  `;
  insertHTML(html);
  onChange(ref.current?.innerHTML || "");
};

export const cmdInsertTable = (ref: EditorRef, onChange: OnChangeFn) => {
  const html = `
    <div class="overflow-x-auto my-4 group/table-wrapper">
      <table class="w-full border-collapse border border-slate-300 text-sm">
        <thead>
          <tr class="bg-slate-50">
            <th class="border border-slate-300 p-2 text-left font-semibold min-w-[100px]">Header 1</th>
            <th class="border border-slate-300 p-2 text-left font-semibold min-w-[100px]">Header 2</th>
            <th class="border border-slate-300 p-2 text-left font-semibold min-w-[100px]">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 p-2">Cell 1</td>
            <td class="border border-slate-300 p-2">Cell 2</td>
            <td class="border border-slate-300 p-2">Cell 3</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2">Cell 4</td>
            <td class="border border-slate-300 p-2">Cell 5</td>
            <td class="border border-slate-300 p-2">Cell 6</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p><br /></p>
  `;
  insertHTML(html);
  onChange(ref.current?.innerHTML || "");
};

// --- COLORS ---
export const cmdTextColor = (ref: EditorRef, onChange: OnChangeFn, colorClass: string) => {
  toggleTextColor(colorClass);
  onChange(ref.current?.innerHTML || "");
};

export const cmdHighlight = (ref: EditorRef, onChange: OnChangeFn, bgClass: string) => {
  toggleHighlight(bgClass);
  onChange(ref.current?.innerHTML || "");
};

// --- CHECKLIST ---
export const cmdChecklist = (ref: EditorRef, onChange: OnChangeFn) => {
  toggleCheckList();
  onChange(ref.current?.innerHTML || "");
};

// --- COLUMNS ---
export const cmdInsertColumns = (ref: EditorRef, onChange: OnChangeFn) => {
  if (isInColumn()) {
    alert("Nesting columns is not supported. Please create columns in the main editor area.");
    return;
  }
  const html = createColumns(2);
  insertHTML(html);
  onChange(ref.current?.innerHTML || "");
};

// --- COLLAPSIBLE SECTION ---
export const cmdInsertCollapsible = (ref: EditorRef, onChange: OnChangeFn) => {
  const id = `section-${Math.random().toString(36).substr(2, 9)}`;
  const html = `
    <details class="collapsible-section mx-1.5" id="${id}" open>
      <summary>
        <div class="section-toggle-area" contenteditable="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
        <span class="section-title" data-placeholder="Section Title..."></span>
        <div class="section-actions" contenteditable="false">
          <button class="btn-section-more" title="More options" data-section-id="${id}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
        </div>
      </summary>
      <div class="content">
        <p><br /></p>
      </div>
    </details>
    <p><br /></p>
  `;
  insertHTML(html);
  onChange(ref.current?.innerHTML || "");
};