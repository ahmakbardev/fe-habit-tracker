"use client";

import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { NoteService } from "@/app/(main)/notes/services/note-service";

type Props = {
  onSubmit: (data: { url: string }) => void;
};

export default function ImagePopover({ onSubmit }: Props) {
  const [url, setUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- LOGIC SUBMIT URL ---
  const submitUrl = () => {
    if (!url.trim()) return;
    onSubmit({ url: url.trim() });
    setUrl("");
  };

  // --- LOGIC FILE HANDLE ---
  const handleFile = async (file: File) => {
    try {
      setIsUploading(true);
      const res = await NoteService.uploadMedia(file);
      onSubmit({ url: res.url });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // --- DRAG EVENTS ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium text-sm text-slate-700">Upload Image</h4>

        <label
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            group flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-lg cursor-pointer transition-all
            ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 hover:bg-slate-50 hover:border-slate-400"
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
            {isUploading ? (
              <Loader2 className="w-8 h-8 mb-2 animate-spin text-blue-500" />
            ) : (
              <Upload
                className={`w-8 h-8 mb-2 transition-colors ${
                  isDragging
                    ? "text-blue-500"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
            )}
            <p className="text-xs text-center px-4">
              <span className="font-semibold text-slate-700">
                {isUploading ? "Uploading..." : "Click to upload"}
              </span>{" "}
              {!isUploading && "or drag and drop"}
            </p>
            {!isUploading && (
              <p className="text-[10px] mt-1 text-slate-400">
                SVG, PNG, JPG or GIF
              </p>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div className="h-[1px] bg-slate-200 flex-1" />
        <span className="text-[10px] text-slate-400 uppercase font-bold">
          OR via URL
        </span>
        <div className="h-[1px] bg-slate-200 flex-1" />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-1.5 border rounded-md outline-none text-sm focus:border-black transition"
          placeholder="Paste image link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitUrl()}
        />
        <button
          onClick={submitUrl}
          disabled={!url.trim()}
          className="px-3 py-1.5 rounded-md bg-black text-white text-xs font-medium hover:bg-opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>
    </div>
  );
}
