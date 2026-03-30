// app/(main)/notes/components/text-editor/html-utils.ts

import { restoreCaretManually, saveCaretManually, moveCaretToEnd } from "./caret-utils";

// Helper: Cari Block Parent Terdekat (agar tidak salah bungkus)
const getSelectedBlockElement = (): HTMLElement | null => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  
  let node = sel.anchorNode;
  // Jika node adalah text, naik ke parent element-nya
  if (node && node.nodeType === 3) node = node.parentNode;
  
  // Traverse ke atas sampai ketemu elemen blok atau mentok di root editor
  while (node && node instanceof HTMLElement) {
    const tag = node.tagName.toLowerCase();
    // Stop jika ketemu elemen blok formatting
    if (["div", "p", "h1", "h2", "h3", "blockquote", "li", "pre", "ul", "ol"].includes(tag)) {
      return node;
    }
    // Stop jika kena root editor (cegah editing wrapper utama)
    if (node.classList.contains("rte")) return null; 
    node = node.parentElement;
  }
  return null;
};

export const toggleFormat = (format: string) => {
  document.execCommand(format, false, undefined);
};
// --- LOGIC H1 & BLOCKQUOTE ---
export const toggleBlockType = (tagName: string) => {
  saveCaretManually();
  const block = getSelectedBlockElement();

  // Jika belum punya block (text telanjang), format langsung
  if (!block) {
    document.execCommand("formatBlock", false, tagName);
    return;
  }

  // Toggle Logic: Jika sudah H1 -> Balikin jadi DIV (default editor), Jika belum -> Jadi H1
  const currentTag = block.tagName.toLowerCase();
  const targetTag = tagName.toLowerCase();

  // Jika tag saat ini sama dengan target, kita "reset" ke DIV
  if (currentTag === targetTag) {
    document.execCommand("formatBlock", false, "div");
  } else {
    document.execCommand("formatBlock", false, tagName);
  }

  setTimeout(restoreCaretManually, 0);
};

// ... LOGIC CODE ...

// --- LOGIC ALIGNMENT (ANTI-NESTING) ---
export const toggleBlockClass = (className: string, groupClasses: string[]) => {
  saveCaretManually();
  let block = getSelectedBlockElement();
  
  // Jika text belum punya wrapper (misal barusaja diketik di root), bungkus dulu dengan DIV
  if (!block) {
    document.execCommand("formatBlock", false, "div");
    // Ambil ulang block yang baru dibuat
    block = getSelectedBlockElement();
  }
  
  if (block) {
    // 1. Hapus semua class alignment lama (biar gak numpuk)
    block.classList.remove(...groupClasses);
    
    // 2. Tambah class baru (kecuali 'text-left' default bisa opsional dihapus)
    block.classList.add(className);
    
    // 3. Clean up: Jika class kosong, remove attribute class (opsional)
    if (block.className === "") block.removeAttribute("class");
  }
  
  setTimeout(restoreCaretManually, 0);
};

// --- LOGIC CODE (WRAPPER MANUAL) ---
export const toggleCode = () => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  // Cek apakah parent sudah code? (Simple toggle check)
  const parent = sel.anchorNode?.parentElement;
  if (parent && parent.tagName === "CODE") {
     // Opsional: Implement unwrap logic here if needed
     return; 
  }

  const selectedText = range.toString();
  range.deleteContents();
  
  const codeEl = document.createElement("code");
  // Isi text + spasi zero-width agar cursor tidak stuck
  codeEl.textContent = selectedText || "\u00A0"; 
  
  range.insertNode(codeEl);
  range.setStartAfter(codeEl);
  range.setEndAfter(codeEl);
  sel.removeAllRanges();
  sel.addRange(range);
};

export const toggleList = () => document.execCommand("insertUnorderedList");
export const toggleOrderedList = () => document.execCommand("insertOrderedList");

export const insertHTML = (html: string) => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  
  const div = document.createElement("div");
  div.innerHTML = html.trim();
  
  const fragment = document.createDocumentFragment();
  while (div.firstChild) {
    fragment.appendChild(div.firstChild);
  }
  
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

// [BARU] Toggle Text Color (Menggunakan span wrapper)
export const toggleTextColor = (colorClass: string) => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  // Gunakan wrapper span untuk styling warna
  const span = document.createElement("span");
  span.className = colorClass;
  
  const range = sel.getRangeAt(0);
  const selectedText = range.toString();
  
  if (selectedText.length > 0) {
    // Cek apakah parent sudah span warna? kalau ya, ganti class-nya
    const parent = sel.anchorNode?.parentElement;
    if (parent && parent.tagName === "SPAN" && parent.classList.contains("text-")) {
        // Reset class lama, tambah baru (asumsi class warna diawali text-)
        // Logic ini bisa diperbaiki untuk menghapus class text-* lama lebih spesifik jika perlu
        parent.className = colorClass;
    } else {
        range.surroundContents(span);
    }
  }
  
  sel.removeAllRanges(); 
};

// [BARU] Toggle Highlight (Background Color)
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

// --- [PERBAIKAN] CHECKLIST LOGIC ---
export const toggleCheckList = () => {
  // PENTING: Hapus saveCaretManually() di sini.
  // Karena kita akan memanipulasi DOM (prepend), posisi caret lama jadi tidak valid.
  
  // 1. Buat List Standar dulu
  document.execCommand("insertUnorderedList");

  // 2. Cari elemen UL terdekat
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  
  let node = sel.anchorNode;
  if (node && node.nodeType === 3) {
     node = node.parentElement;
  }

  // Cari elemen LI dan UL
  const li = (node as HTMLElement)?.closest("li");
  const ul = (node as HTMLElement)?.closest("ul");

  if (ul) {
    // 3. Tambah class task-list ke UL
    ul.classList.add("task-list");
    
    // 4. Inject Checkbox & PERBAIKI POSISI CARET
    if (li) {
       ensureCheckboxInLi(li);
       
       // [FIX] Paksa kursor ke AKHIR LI (setelah checkbox)
       // setTimeout 0 agar browser selesai render DOM dulu
       setTimeout(() => {
         moveCaretToEnd(li as HTMLElement);
       }, 0);
    }

    // 5. Scan anak lain (selection banyak baris)
    const items = ul.querySelectorAll("li");
    items.forEach(item => ensureCheckboxInLi(item));
  }
};

// Helper: Suntik checkbox ke dalam LI jika belum ada
export const ensureCheckboxInLi = (li: HTMLLIElement | Element) => {
  const firstChild = li.firstElementChild;
  const hasCheckbox =
    firstChild &&
    firstChild.tagName === "INPUT" &&
    (firstChild as HTMLInputElement).type === "checkbox";

  if (!hasCheckbox) {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.contentEditable = "false"; // Agar checkbox bisa diklik di dalam contentEditable
    
    // [UPDATE] Gunakan class generic saja, styling detail kita pindah ke RichTextEditor
    // "select-none" penting agar checkbox tidak ikut ter-highlight saat blok teks
    checkbox.className = "task-checkbox select-none"; 
    
    checkbox.removeAttribute("checked"); // Default unchecked
    li.prepend(checkbox);
  }
};