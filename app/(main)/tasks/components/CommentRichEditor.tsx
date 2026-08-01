"use client";

import { useRef, useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Bold, Italic, Underline, List, ListOrdered, Quote, Link as LinkIcon } from "lucide-react";
import ToolbarButton from "../../notes/components/text-editor/ToolbarButton";
import ResponsivePopover from "../../notes/components/text-editor/ResponsivePopover";
import LinkPopover from "../../notes/components/text-editor/popovers/LinkPopover";
import { cmdBold, cmdItalic, cmdUnderline, cmdListItem, cmdOrderedList, cmdBlockquote, cmdLink } from "../../notes/components/text-editor/commands";
import { restoreCaretManually, saveCaretManually } from "../../notes/components/text-editor/caret-utils";

// Only the tags/attributes the comment toolbar can actually produce are
// allowed through — everything else (script, style, event handlers,
// iframes, etc.) is stripped, whether typed, pasted, or loaded from a
// stored comment.
const COMMENT_SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "a", "ul", "ol", "li", "blockquote", "br", "p", "div", "span"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/)/i,
};

export function sanitizeCommentHtml(html: string): string {
  return DOMPurify.sanitize(html, COMMENT_SANITIZE_CONFIG);
}

// Shared with the read-only comment view so posted comments render
// identically to how they looked while being composed.
export const commentContentClasses =
  "text-sm text-slate-700 leading-relaxed [&_strong]:font-bold [&_em]:italic [&_u]:underline " +
  "[&_a]:text-blue-600 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
  "[&_li]:mb-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_blockquote]:italic";

export function isCommentEmpty(html: string): boolean {
  if (!html) return true;
  const stripped = html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
  return stripped === "";
}

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export default function CommentRichEditor({ value, onChange, placeholder = "Write a comment..." }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const currentValue = typeof value === "string" ? value : "";
    if (ref.current.innerHTML !== currentValue && document.activeElement !== ref.current) {
      ref.current.innerHTML = currentValue;
    }
  }, [value]);

  const run = (cmd: (ref: React.RefObject<HTMLDivElement>, onChange: (v: string) => void) => void) => {
    ref.current?.focus();
    cmd(ref as React.RefObject<HTMLDivElement>, onChange);
  };

  const showPlaceholder = isCommentEmpty(value) && !isFocused;

  return (
    <div className="w-full">
      <div className="flex items-center gap-0.5 mb-1.5">
        <ToolbarButton icon={<Bold size={14} />} onClick={() => run(cmdBold)} title="Bold" />
        <ToolbarButton icon={<Italic size={14} />} onClick={() => run(cmdItalic)} title="Italic" />
        <ToolbarButton icon={<Underline size={14} />} onClick={() => run(cmdUnderline)} title="Underline" />
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <ToolbarButton icon={<List size={14} />} onClick={() => run(cmdListItem)} title="Bullet list" />
        <ToolbarButton icon={<ListOrdered size={14} />} onClick={() => run(cmdOrderedList)} title="Numbered list" />
        <ToolbarButton icon={<Quote size={14} />} onClick={() => run(cmdBlockquote)} title="Quote" />
        <ResponsivePopover
          title="Insert Link"
          trigger={
            <button
              onClick={() => {
                ref.current?.focus();
                saveCaretManually();
              }}
              className="p-1 hover:bg-slate-100 rounded transition text-slate-600"
              title="Link"
            >
              <LinkIcon size={14} />
            </button>
          }
        >
          {(close) => (
            <LinkPopover
              onSubmit={({ alias, url }) => {
                setTimeout(() => {
                  ref.current?.focus();
                  restoreCaretManually();
                  cmdLink(ref as React.RefObject<HTMLDivElement>, onChange, alias, url);
                  close();
                }, 0);
              }}
            />
          )}
        </ResponsivePopover>
      </div>

      <div className="relative">
        {showPlaceholder && (
          <span className="absolute left-3 top-2 text-sm text-slate-400 pointer-events-none select-none">{placeholder}</span>
        )}
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onInput={() => {
            if (!ref.current) return;
            const raw = ref.current.innerHTML === "<br>" ? "" : ref.current.innerHTML;
            onChange(sanitizeCommentHtml(raw));
          }}
          className={`min-h-[44px] max-h-[160px] overflow-y-auto w-full px-3 py-2 bg-slate-50 border border-transparent focus:border-slate-200 rounded-xl outline-none transition ${commentContentClasses}`}
        />
      </div>
    </div>
  );
}
