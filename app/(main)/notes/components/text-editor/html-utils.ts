// app/(main)/notes/components/text-editor/html-utils.ts

import { restoreCaretManually, saveCaretManually, moveCaretToEnd } from "./caret-utils";

// Helper: Cari Block Parent Terdekat (agar tidak salah bungkus)
const getSelectedBlockElement = (): HTMLElement | null => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  
  let node = sel.anchorNode;
  if (node && node.nodeType === 3) node = node.parentNode;
  
  while (node && node instanceof HTMLElement) {
    const tag = node.tagName.toLowerCase();
    
    if (tag === "summary") return null;

    // Daftar elemen blok yang sah untuk diberi alignment
    if (["p", "h1", "h2", "h3", "blockquote", "li", "pre", "div"].includes(tag)) {
      // Pastikan bukan wrapper utama editor
      if (node.classList.contains("rte")) return null;
      return node;
    }
    
    if (node.classList.contains("rte")) return null; 
    node = node.parentElement;
  }
  return null;
};

export const toggleFormat = (format: string) => {
  document.execCommand(format, false, undefined);
};

export const toggleBlockType = (tagName: string) => {
  const sel = window.getSelection();
  if (sel?.anchorNode?.parentElement?.closest("summary")) return;

  saveCaretManually();
  const block = getSelectedBlockElement();

  if (!block) {
    document.execCommand("formatBlock", false, tagName);
  } else {
    const currentTag = block.tagName.toLowerCase();
    if (currentTag === tagName.toLowerCase()) {
      document.execCommand("formatBlock", false, "div");
    } else {
      document.execCommand("formatBlock", false, tagName);
    }
  }

  setTimeout(restoreCaretManually, 0);
};

// --- LOGIC ALIGNMENT (FORCE CLASS & STYLE) ---
export const toggleBlockClass = (className: string, groupClasses: string[]) => {
  // 1. Simpan Caret (Cegah lompat kursor)
  saveCaretManually();
  
  // 2. Cari blok
  let block = getSelectedBlockElement();
  
  // 3. Jika teks "telanjang" (langsung di root), bungkus dengan DIV dulu
  if (!block) {
    document.execCommand("formatBlock", false, "div");
    block = getSelectedBlockElement();
  }
  
  if (block) {
    // 4. BERSIHKAN SEMUA CLASS LAMA (PENTING)
    block.classList.remove(...groupClasses);
    
    // 5. TAMBAH CLASS BARU
    block.classList.add(className);
    
    // 6. FORCE INLINE STYLE (Agar 100% works)
    let alignValue = "left";
    if (className.includes("center")) alignValue = "center";
    else if (className.includes("right")) alignValue = "right";
    else if (className.includes("justify")) alignValue = "justify";
    
    block.style.textAlign = alignValue;

    // 7. Cleanup jika class kosong
    if (block.className === "") block.removeAttribute("class");
  }
  
  // 8. Kembalikan Caret
  setTimeout(restoreCaretManually, 0);
};

export const toggleCode = () => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const parent = sel.anchorNode?.parentElement;
  if (parent && parent.tagName === "CODE") return;

  const selectedText = range.toString();
  range.deleteContents();
  
  const codeEl = document.createElement("code");
  codeEl.textContent = selectedText || "\u00A0"; 
  
  range.insertNode(codeEl);
  range.setStartAfter(codeEl);
  range.setEndAfter(codeEl);
  sel.removeAllRanges();
  sel.addRange(range);
};

export const toggleList = () => document.execCommand("insertUnorderedList");
export const toggleOrderedList = () => document.execCommand("insertOrderedList");

export const isInColumn = (): boolean => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  return !!(sel.anchorNode as HTMLElement)?.parentElement?.closest(".rte-column");
};

export const insertHTML = (html: string) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const fragment = template.content;
  
  const lastNode = fragment.lastChild;
  range.insertNode(fragment);
  
  if (lastNode) {
    const newRange = document.createRange();
    newRange.setStartAfter(lastNode);
    newRange.setEndAfter(lastNode);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }
};

export const toggleTextColor = (colorClass: string) => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const span = document.createElement("span");
  span.className = colorClass;
  
  const range = sel.getRangeAt(0);
  const selectedText = range.toString();
  
  if (selectedText.length > 0) {
    const parent = sel.anchorNode?.parentElement;
    if (parent && parent.tagName === "SPAN" && parent.className.includes("text-")) {
        parent.className = colorClass;
    } else {
        range.surroundContents(span);
    }
  }
  sel.removeAllRanges(); 
};

export const toggleHighlight = (bgClass: string) => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const span = document.createElement("span");
  span.className = bgClass; 
  
  const range = sel.getRangeAt(0);
  const selectedText = range.toString();
  
  if (selectedText.length > 0) {
     const parent = sel.anchorNode?.parentElement;
     if (parent && parent.tagName === "SPAN" && parent.className.includes("bg-")) {
         parent.className = bgClass;
     } else {
         range.surroundContents(span);
     }
  }
  sel.removeAllRanges();
};

export const toggleExtraBold = () => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

  const range = sel.getRangeAt(0);
  let node = sel.anchorNode;
  if (node?.nodeType === 3) node = node.parentElement;

  // Cari apakah selection sudah berada di dalam span.font-black
  const existingExtraBold = (node as HTMLElement)?.closest(".font-black");

  if (existingExtraBold) {
    // UNWRAP: Kembalikan ke teks biasa
    const parent = existingExtraBold.parentNode;
    while (existingExtraBold.firstChild) {
      parent?.insertBefore(existingExtraBold.firstChild, existingExtraBold);
    }
    parent?.removeChild(existingExtraBold);
  } else {
    // WRAP: Bungkus dengan span font-black
    const span = document.createElement("span");
    // font-black di Tailwind adalah font-weight 900
    span.className = "font-black text-slate-900 !font-black"; 
    span.style.fontWeight = "900"; // Force inline style agar pasti

    try {
      range.surroundContents(span);
    } catch (e) {
      // Jika surroundContents gagal (karena seleksi parsial antar elemen), gunakan cara manual
      const content = range.extractContents();
      span.appendChild(content);
      range.insertNode(span);
    }
  }

  sel.removeAllRanges();
  setTimeout(restoreCaretManually, 0);
};
export const toggleCheckList = () => {
  document.execCommand("insertUnorderedList");
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  
  let node = sel.anchorNode;
  if (node && node.nodeType === 3) node = node.parentElement;

  const li = (node as HTMLElement)?.closest("li");
  const ul = (node as HTMLElement)?.closest("ul");

  if (ul) {
    ul.classList.add("task-list");
    if (li) {
       ensureCheckboxInLi(li);
       setTimeout(() => moveCaretToEnd(li as HTMLElement), 0);
    }
    const items = ul.querySelectorAll("li");
    items.forEach(item => ensureCheckboxInLi(item));
  }
};

export const ensureCheckboxInLi = (li: HTMLLIElement | Element) => {
  const firstChild = li.firstElementChild;
  const hasCheckbox =
    firstChild &&
    firstChild.tagName === "INPUT" &&
    (firstChild as HTMLInputElement).type === "checkbox";

  if (!hasCheckbox) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.contentEditable = "false";
    checkbox.className = "task-checkbox select-none"; 
    checkbox.removeAttribute("checked");
    li.prepend(checkbox);
  }
};
