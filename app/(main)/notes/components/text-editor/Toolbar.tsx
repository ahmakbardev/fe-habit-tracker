// app/(main)/notes/components/text-editor/Toolbar.tsx
"use client";

import { RefObject } from "react";
import ResponsivePopover from "./ResponsivePopover";

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
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListOrdered,
  TableIcon,
  Baseline,
  SquareCheck,
  Undo,
  Redo,
  Columns2,
  Type,
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

import {
  cmdBold,
  cmdExtraBold,
  cmdItalic,
  cmdUnderline,
  cmdHeading1,
  cmdListItem,
  cmdBlockquote,
  cmdCode,
  cmdLink,
  cmdImage,
  cmdAlignLeft,
  cmdAlignCenter,
  cmdAlignRight,
  cmdAlignJustify,
  cmdOrderedList,
  cmdInsertTable,
  cmdTextColor,
  cmdHighlight,
  cmdChecklist,
  cmdUndo,
  cmdRedo,
  cmdInsertColumns,
} from "./commands";
import { restoreCaretManually, saveCaretManually } from "./caret-utils";
import ImagePopover from "./popovers/ImagePopover";
import ColorPopover from "./popovers/ColorPopover";
import LinkPopover from "./popovers/LinkPopover";

type Props = {
  refEl: HTMLDivElement | null;
  onChange: (v: string) => void;
};

type CommandFn = (
  ref: RefObject<HTMLDivElement>,
  onChange: (v: string) => void
) => void;

export default function Toolbar({ refEl, onChange }: Props) {
  const refObj = (
    refEl ? { current: refEl } : null
  ) as RefObject<HTMLDivElement>;

  const run = (action: CommandFn) => {
    if (refObj && refObj.current) {
      refObj.current.focus();
      action(refObj, onChange);
    }
  };

  const handleOpen = () => {
    refEl?.focus();
    saveCaretManually();
  };

  return (
    <div className="flex gap-2 mb-3 pb-2 items-center flex-wrap">
      {/* HISTORY */}
      <ToolbarButton icon={<Undo size={18} />} onClick={() => run(cmdUndo)} />
      <ToolbarButton icon={<Redo size={18} />} onClick={() => run(cmdRedo)} />

      <div className="w-[1px] h-6 bg-slate-200 mx-1" />

      {/* FORMATTING */}
      <ToolbarButton icon={<Bold size={18} />} onClick={() => run(cmdBold)} />
      <ToolbarButton
        icon={
          <div className="relative">
            <Type size={18} className="font-black" />
            <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-slate-200 rounded px-0.5">
              +
            </span>
          </div>
        }
        onClick={() => run(cmdExtraBold)}
        title="Extra Bold"
      />
      <ToolbarButton
        icon={<Italic size={18} />}
        onClick={() => run(cmdItalic)}
      />
      <ToolbarButton
        icon={<Underline size={18} />}
        onClick={() => run(cmdUnderline)}
      />

      <div className="w-[1px] h-6 bg-slate-200 mx-1" />

      {/* ALIGNMENT */}
      <ToolbarButton
        icon={<AlignLeft size={18} />}
        onClick={() => run(cmdAlignLeft)}
      />
      <ToolbarButton
        icon={<AlignCenter size={18} />}
        onClick={() => run(cmdAlignCenter)}
      />
      <ToolbarButton
        icon={<AlignRight size={18} />}
        onClick={() => run(cmdAlignRight)}
      />
      <ToolbarButton
        icon={<AlignJustify size={18} />}
        onClick={() => run(cmdAlignJustify)}
      />

      {/* COLOR PICKER */}
      <ResponsivePopover
        title="Colors & Highlights"
        trigger={
          <button onClick={handleOpen} className="p-1 hover:bg-slate-100 rounded">
            <Baseline size={18} />
          </button>
        }
      >
        {(close) => (
          <ColorPopover
            onSelectColor={(colorClass) => {
              if (!refEl) return;
              setTimeout(() => {
                refEl.focus();
                restoreCaretManually();
                cmdTextColor({ current: refEl }, onChange, colorClass);
                close();
              }, 0);
            }}
            onSelectHighlight={(bgClass) => {
              if (!refEl) return;
              setTimeout(() => {
                refEl.focus();
                restoreCaretManually();
                cmdHighlight({ current: refEl }, onChange, bgClass);
                close();
              }, 0);
            }}
          />
        )}
      </ResponsivePopover>

      <div className="w-[1px] h-6 bg-slate-200 mx-1" />

      {/* BLOCKS */}
      <ToolbarButton
        icon={<Heading1 size={18} />}
        onClick={() => run(cmdHeading1)}
      />
      <ToolbarButton
        icon={<List size={18} />}
        onClick={() => run(cmdListItem)}
      />
      <ToolbarButton
        icon={<ListOrdered size={18} />}
        onClick={() => run(cmdOrderedList)}
      />

      <ToolbarButton
        icon={<SquareCheck size={18} />}
        onClick={() => run(cmdChecklist)}
      />

      <ToolbarButton
        icon={<TableIcon size={18} />}
        onClick={() => run(cmdInsertTable)}
      />

      <ToolbarButton
        icon={<Columns2 size={18} />}
        onClick={() => run(cmdInsertColumns)}
      />

      <ToolbarButton
        icon={<Quote size={18} />}
        onClick={() => run(cmdBlockquote)}
      />

      <ToolbarButton icon={<Code size={18} />} onClick={() => run(cmdCode)} />

      {/* LINK */}
      <ResponsivePopover
        title="Insert Link"
        trigger={
          <button onClick={handleOpen} className="p-1 hover:bg-slate-100 rounded">
            <LinkIcon size={18} />
          </button>
        }
      >
        {(close) => (
          <LinkPopover
            onSubmit={({ alias, url }) => {
              if (!refEl) return;
              setTimeout(() => {
                refEl.focus();
                restoreCaretManually();
                cmdLink({ current: refEl }, onChange, alias, url);
                close();
              }, 0);
            }}
          />
        )}
      </ResponsivePopover>

      {/* IMAGE */}
      <ResponsivePopover
        title="Insert Image"
        trigger={
          <button onClick={handleOpen} className="p-1 hover:bg-slate-100 rounded">
            <ImageIcon size={18} />
          </button>
        }
      >
        {(close) => (
          <ImagePopover
            onSubmit={({ url }) => {
              if (!refEl) return;
              setTimeout(() => {
                refEl.focus();
                restoreCaretManually();
                cmdImage({ current: refEl }, onChange, url);
                close();
              }, 0);
            }}
          />
        )}
      </ResponsivePopover>
    </div>
  );
}
