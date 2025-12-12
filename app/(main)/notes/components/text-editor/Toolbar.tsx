// app/(main)/notes/components/text-editor/Toolbar.tsx
"use client";

import { Popover, PopoverTrigger } from "@/components/ui/popover";
import LinkPopover from "./popovers/LinkPopover";
import { RefObject } from "react"; // [FIX] Import RefObject

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
} from "lucide-react";

import ToolbarButton from "./ToolbarButton";

import {
  cmdBold,
  cmdItalic,
  cmdUnderline,
  cmdHeading1,
  cmdListItem,
  cmdBlockquote,
  cmdCode,
  cmdLink,
  cmdImage,
  // New Commands
  cmdAlignLeft,
  cmdAlignCenter,
  cmdAlignRight,
  cmdAlignJustify,
  cmdOrderedList,
  cmdInsertTable,
  cmdTextColor,
  cmdHighlight,
  cmdChecklist,
} from "./commands";
import { restoreCaretManually, saveCaretManually } from "./caret-utils";
import ImagePopover from "./popovers/ImagePopover";
import ColorPopover from "./popovers/ColorPopover";

type Props = {
  refEl: HTMLDivElement | null;
  onChange: (v: string) => void;
};

// [FIX] Definisi Tipe untuk Command Function
type CommandFn = (
  ref: RefObject<HTMLDivElement>,
  onChange: (v: string) => void
) => void;

export default function Toolbar({ refEl, onChange }: Props) {
  // [FIX] Casting ke RefObject agar tipe aman
  const refObj = (
    refEl ? { current: refEl } : null
  ) as RefObject<HTMLDivElement>;

  // [FIX] Ganti any dengan CommandFn
  const run = (action: CommandFn) => {
    if (refObj && refObj.current) {
      refObj.current.focus(); // Pastikan fokus balik ke editor sebelum command
      action(refObj, onChange);
    }
  };

  return (
    <div className="flex gap-2 mb-3 border-b pb-2 items-center flex-wrap">
      {/* FORMATTING */}
      <ToolbarButton icon={<Bold size={18} />} onClick={() => run(cmdBold)} />
      <ToolbarButton
        icon={<Italic size={18} />}
        onClick={() => run(cmdItalic)}
      />
      <ToolbarButton
        icon={<Underline size={18} />}
        onClick={() => run(cmdUnderline)}
      />

      <div className="w-[1px] h-6 bg-slate-200 mx-1" />

      {/* ALIGNMENT - Logic Baru */}
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

      {/* [BARU] COLOR PICKER POPOVER */}
      <Popover>
        <PopoverTrigger
          asChild
          onClick={() => {
            refEl?.focus();
            saveCaretManually();
          }}
        >
          <button className="p-1 hover:bg-slate-100 rounded">
            <Baseline size={18} />
          </button>
        </PopoverTrigger>
        <ColorPopover
          onSelectColor={(colorClass) => {
            if (!refEl) return;
            setTimeout(() => {
              refEl.focus();
              restoreCaretManually();
              cmdTextColor({ current: refEl }, onChange, colorClass);
            }, 0);
          }}
          onSelectHighlight={(bgClass) => {
            if (!refEl) return;
            setTimeout(() => {
              refEl.focus();
              restoreCaretManually();
              cmdHighlight({ current: refEl }, onChange, bgClass);
            }, 0);
          }}
        />
      </Popover>

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
        icon={<Quote size={18} />}
        onClick={() => run(cmdBlockquote)}
      />

      {/* Code pakai pre/block sementara */}
      <ToolbarButton icon={<Code size={18} />} onClick={() => run(cmdCode)} />

      {/* Popovers (Link & Image) Code tetap sama ... */}
      <Popover>
        <PopoverTrigger
          asChild
          onClick={() => {
            refEl?.focus();
            saveCaretManually();
          }}
        >
          <button className="p-1 hover:bg-slate-100 rounded">
            <LinkIcon size={18} />
          </button>
        </PopoverTrigger>
        <LinkPopover
          onSubmit={({ alias, url }) => {
            if (!refEl) return;
            setTimeout(() => {
              refEl.focus();
              restoreCaretManually();
              cmdLink({ current: refEl }, onChange, alias, url);
            }, 0);
          }}
        />
      </Popover>

      <Popover>
        <PopoverTrigger
          asChild
          onClick={() => {
            refEl?.focus();
            saveCaretManually();
          }}
        >
          <button className="p-1 hover:bg-slate-100 rounded">
            <ImageIcon size={18} />
          </button>
        </PopoverTrigger>
        <ImagePopover
          onSubmit={({ url }) => {
            if (!refEl) return;
            setTimeout(() => {
              refEl.focus();
              restoreCaretManually();
              cmdImage({ current: refEl }, onChange, url);
            }, 0);
          }}
        />
      </Popover>
    </div>
  );
}
