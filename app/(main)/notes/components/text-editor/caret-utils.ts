// app/(main)/notes/components/text-editor/caret-utils.ts

export const saveCaret = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0);
};

export const restoreCaret = (range: Range | null) => {
  if (!range) return;
  const sel = window.getSelection();
  if (!sel) return;

  sel.removeAllRanges();
  sel.addRange(range);
};

let savedRange: Range | null = null;

export const saveCaretManually = () => {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  savedRange = sel.getRangeAt(0).cloneRange();
};

export const restoreCaretManually = () => {
  if (!savedRange) return;

  const sel = window.getSelection();
  if (!sel) return;

  sel.removeAllRanges();
  sel.addRange(savedRange);
};

// Fungsi ini yang kita gunakan untuk memperbaiki posisi kursor checklist
export const moveCaretToEnd = (el: HTMLElement) => {
  el.focus();
  const range = document.createRange();
  
  // Pilih seluruh konten elemen
  range.selectNodeContents(el);
  
  // Collapse ke FALSE (artinya ke akhir konten)
  range.collapse(false); 
  
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
};

export const moveCaretToStart = (el: HTMLElement) => {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true); 
  
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
};