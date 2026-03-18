"use client";

import { useState } from "react";
import { PopoverContent } from "@/components/ui/popover";

type Props = {
  onSubmit: (data: { alias: string; url: string }) => void;
};

export default function LinkPopover({ onSubmit }: Props) {
  const [alias, setAlias] = useState("");
  const [url, setUrl] = useState("");

  const submit = () => {
    if (!url.trim()) return;
    onSubmit({ alias: alias.trim() || url, url });
    setAlias("");
    setUrl("");
  };

  return (
    <PopoverContent className="w-64 p-4 border rounded-lg shadow bg-white">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-500">Text / Alias</label>
          <input
            className="mt-1 w-full px-2 py-1 border rounded-md outline-none text-sm"
            placeholder="Example: Google"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs text-slate-500">URL</label>
          <input
            className="mt-1 w-full px-2 py-1 border rounded-md outline-none text-sm"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <button
          onClick={submit}
          className="w-full py-2 rounded-md bg-black text-white text-sm hover:bg-opacity-80 transition"
        >
          Insert Link
        </button>
      </div>
    </PopoverContent>
  );
}
