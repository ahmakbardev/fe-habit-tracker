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

export const toggleCode = (forceBlock: boolean = false) => {
  saveCaretManually();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;

  const range = sel.getRangeAt(0);
  const parent = sel.anchorNode?.parentElement;
  
  if (parent && (parent.tagName === "CODE" || parent.tagName === "PRE")) return;

  const selectedText = range.toString();
  const isMultiLine = forceBlock || selectedText.includes("\n") || selectedText.length > 100;

  range.deleteContents();
  
  if (isMultiLine) {
    const preEl = document.createElement("pre");
    const codeEl = document.createElement("code");
    codeEl.textContent = selectedText || "\n";
    preEl.appendChild(codeEl);
    range.insertNode(preEl);
    
    // Add an empty paragraph after pre for easier editing
    const p = document.createElement("p");
    p.innerHTML = "<br>";
    preEl.after(p);
    
    // Move caret inside the code block
    const newRange = document.createRange();
    newRange.setStart(codeEl, 0);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } else {
    const codeEl = document.createElement("code");
    codeEl.textContent = selectedText || "\u00A0"; 
    range.insertNode(codeEl);
    range.setStartAfter(codeEl);
    range.setEndAfter(codeEl);
    sel.removeAllRanges();
    sel.addRange(range);
  }
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

// --- FOREIGN FORMATTING DETECTION & CLEANUP ---
// Used to detect content pasted from another site/app (e.g. Google Docs, Word, a blog)
// that carries its own fonts/colors, so we can offer to reformat it to match our own style.

const FOREIGN_STYLE_PATTERN = /font-family\s*:|color\s*:\s*(rgb|#)|background-color\s*:|font-size\s*:/i;
const WORD_ARTIFACT_PATTERN = /mso-|<o:p|<w:|class="?Mso/i;

export const hasForeignFormatting = (html: string): boolean => {
  if (!html || !html.trim()) return false;
  if (/<font[\s>]/i.test(html)) return true;
  if (WORD_ARTIFACT_PATTERN.test(html)) return true;
  if (FOREIGN_STYLE_PATTERN.test(html)) return true;
  return false;
};

// Tags whose semantic meaning we keep, mapped to the attributes we allow through.
const ALLOWED_TAGS: Record<string, string[]> = {
  p: [], div: [], br: [], hr: [],
  h1: [], h2: [], h3: [],
  ul: [], ol: [], li: [],
  blockquote: [], pre: [], code: [],
  strong: [], b: [], em: [], i: [], u: [], s: [], strike: [],
  a: ["href"],
  table: [], thead: [], tbody: [], tr: [],
  td: ["colspan", "rowspan"], th: ["colspan", "rowspan"],
  img: ["src", "alt"],
};

// Headings beyond h3 aren't supported by the editor's own commands, so fold them down.
const HEADING_DOWNGRADE: Record<string, string> = { h4: "h3", h5: "h3", h6: "h3" };

// Tags that must never survive into the editor: script/executable containers,
// embeddable documents, and interactive form controls we don't support.
const DANGEROUS_TAGS = new Set([
  "script", "style", "meta", "link", "title", "head", "xml",
  "iframe", "object", "embed", "applet", "form", "input", "button",
  "textarea", "select", "svg", "math", "base", "noscript", "template",
]);

// Google Docs/Word wrap plain text in <b style="font-weight:normal">, <i style="font-style:normal">,
// etc. as layout artifacts, not real emphasis - treat those as wrappers, not formatting.
const isFakeEmphasis = (tag: string, style: string): boolean => {
  if ((tag === "b" || tag === "strong") && /font-weight\s*:\s*(normal|400|inherit)/i.test(style)) return true;
  if ((tag === "i" || tag === "em") && /font-style\s*:\s*(normal|inherit)/i.test(style)) return true;
  if (tag === "u" && /text-decoration(-line)?\s*:\s*none/i.test(style)) return true;
  return false;
};

// Strips known CSS-based XSS vectors (old-IE expression()/behavior/-moz-binding, javascript: in
// url()) from a style attribute value. Returns "" if the whole value looks unsafe.
// Browsers strip ASCII tab/newline/CR characters from anywhere in a URL (and leading C0
// controls/space) before parsing its scheme - e.g. "jav\tascript:alert(1)" is read as
// "javascript:alert(1)". A filter that only matches the literal scheme string can be bypassed
// this way, so normalize the same way the browser does before checking it.
const normalizeUrlLike = (value: string): string =>
  value.replace(/[\t\n\r]/g, "").replace(/^[\x00-\x20]+/, "");

const sanitizeStyleValue = (style: string): string => {
  if (!style) return "";
  if (/javascript:|expression\s*\(|-moz-binding|behavior\s*:|@import/i.test(normalizeUrlLike(style))) return "";
  return style;
};

const sanitizeUrlAttr = (value: string): string | null => {
  if (/^(javascript|data|vbscript):/i.test(normalizeUrlLike(value))) return null;
  return value;
};

type SanitizeOpts = { preserveStyle?: boolean };

// Recursively rebuilds a pasted DOM subtree using only an allowlist of tags/attributes.
// - preserveStyle=false ("clean" mode): unknown/decorative wrappers (span, font, div-with-style)
//   are unwrapped, keeping just their text - used to strip foreign fonts/colors entirely.
// - preserveStyle=true ("keep original formatting" mode): the same allowlist and dangerous-tag
//   removal applies (so no scripts/handlers/iframes survive), but sanitized style/class are kept
//   on every element - including via a plain <span> wrapper for otherwise-unrecognized tags - so
//   the pasted look is preserved instead of the content being unwrapped.
const sanitizeNode = (node: Node, opts: SanitizeOpts = {}): Node[] => {
  if (node.nodeType === Node.TEXT_NODE) return [node.cloneNode(true)];
  if (node.nodeType !== Node.ELEMENT_NODE) return []; // drop comments, etc.

  const el = node as HTMLElement;
  const originalTag = el.tagName.toLowerCase();
  if (DANGEROUS_TAGS.has(originalTag)) return [];

  const children: Node[] = [];
  el.childNodes.forEach((child) => children.push(...sanitizeNode(child, opts)));

  if (isFakeEmphasis(originalTag, el.getAttribute("style") || "")) return children;

  const tag = HEADING_DOWNGRADE[originalTag] || originalTag;
  const allowedAttrs = ALLOWED_TAGS[tag];

  if (!allowedAttrs) {
    // Unrecognized/purely-decorative tag (span, font, etc.)
    if (!opts.preserveStyle) return children; // unwrap, keep only the text/children
    const style = sanitizeStyleValue(el.getAttribute("style") || "");
    const cls = el.getAttribute("class");
    if (!style && !cls) return children; // nothing worth a wrapper for - unwrap
    const span = document.createElement("span");
    if (style) span.setAttribute("style", style);
    if (cls) span.setAttribute("class", cls);
    children.forEach((child) => span.appendChild(child));
    return [span];
  }

  const clean = document.createElement(tag);
  allowedAttrs.forEach((attr) => {
    const value = el.getAttribute(attr);
    if (!value) return;
    if (attr === "href" || attr === "src") {
      const safe = sanitizeUrlAttr(value);
      if (safe === null) return;
      clean.setAttribute(attr, safe);
      return;
    }
    clean.setAttribute(attr, value);
  });
  if (opts.preserveStyle) {
    const style = sanitizeStyleValue(el.getAttribute("style") || "");
    if (style) clean.setAttribute("style", style);
    const cls = el.getAttribute("class");
    if (cls) clean.setAttribute("class", cls);
  }
  children.forEach((child) => clean.appendChild(child));
  return [clean];
};

const runSanitizer = (html: string, opts: SanitizeOpts): string => {
  const template = document.createElement("template");
  template.innerHTML = html;

  const container = document.createElement("div");
  template.content.childNodes.forEach((child) => {
    sanitizeNode(child, opts).forEach((n) => container.appendChild(n));
  });

  return container.innerHTML;
};

// "Clean & Match My Style": strips all foreign fonts/colors, keeps only structure.
export const cleanForeignHtml = (html: string): string => runSanitizer(html, { preserveStyle: false });

// "Keep Original Formatting": preserves the pasted look (fonts/colors/classes) while still
// removing every executable tag/attribute (scripts, iframes, event handlers, javascript: URIs,
// dangerous CSS). Always route clipboard HTML through this before inserting it - never insert
// raw clipboard HTML directly.
export const sanitizeHtmlForPaste = (html: string): string => runSanitizer(html, { preserveStyle: true });

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
