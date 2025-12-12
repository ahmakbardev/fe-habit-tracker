"use client";

import { useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Quote,
  Code,
  List,
  Heading1,
  Link as LinkIcon,
  Image as ImageIcon,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const initialSet = useRef(false);

  // SET INITIAL CONTENT
  useEffect(() => {
    if (!ref.current) return;
    if (!initialSet.current) {
      ref.current.innerHTML = value; // HTML, bukan innerText
      initialSet.current = true;
    }
  }, []);

  // SAVE / RESTORE CARET
  const saveCaret = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    return sel.getRangeAt(0);
  };

  const restoreCaret = (range: Range | null) => {
    if (!range) return;
    const sel = window.getSelection();
    if (!sel) return;

    sel.removeAllRanges();
    sel.addRange(range);
  };

  // INSERT HTML safely
  const insertHTML = (html: string) => {
    const el = ref.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const node = temp.firstChild!;
    range.insertNode(node);

    // Move caret after inserted element
    const newRange = document.createRange();
    newRange.setStartAfter(node);
    newRange.setEndAfter(node);

    restoreCaret(newRange);

    onChange(el.innerHTML);
  };

  // BASIC MARKUP APPLY
  const wrapWith = (before: string, after: string = "") => {
    const el = ref.current;
    if (!el) return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const selected = range.toString();

    range.deleteContents();
    range.insertNode(document.createTextNode(before + selected + after));

    onChange(el.innerHTML);
  };

  // INSERT LINK
  const addLink = () => {
    const url = prompt("Enter URL:");
    if (!url) return;

    insertHTML(
      `<a href="${url}" target="_blank" class="text-blue-500 underline">${url}</a>`
    );
  };

  // INSERT IMAGE
  const addImage = () => {
    const url = prompt("Image URL:");
    if (!url) return;

    insertHTML(`<img src="${url}" class="max-w-full rounded-md my-3" />`);
  };

  return (
    <div>
      {/* TOOLBAR */}
      <div className="flex gap-2 mb-3 border-b pb-2">
        <ToolbarButton
          icon={<Bold size={18} />}
          onClick={() => wrapWith("<b>", "</b>")}
        />
        <ToolbarButton
          icon={<Italic size={18} />}
          onClick={() => wrapWith("<i>", "</i>")}
        />
        <ToolbarButton
          icon={<Underline size={18} />}
          onClick={() => wrapWith("<u>", "</u>")}
        />
        <ToolbarButton
          icon={<Heading1 size={18} />}
          onClick={() => wrapWith("<h1>", "</h1>")}
        />
        <ToolbarButton
          icon={<List size={18} />}
          onClick={() => insertHTML("<li>List item</li>")}
        />
        <ToolbarButton
          icon={<Quote size={18} />}
          onClick={() => wrapWith("<blockquote>", "</blockquote>")}
        />
        <ToolbarButton
          icon={<Code size={18} />}
          onClick={() => wrapWith("<code>", "</code>")}
        />

        {/* NEW FEATURES */}
        <ToolbarButton icon={<LinkIcon size={18} />} onClick={addLink} />
        <ToolbarButton icon={<ImageIcon size={18} />} onClick={addImage} />
      </div>

      {/* EDITOR */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className="min-h-[60vh] w-full outline-none leading-relaxed text-slate-700"
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-1 hover:bg-slate-100 rounded transition"
    >
      {icon}
    </button>
  );
}
