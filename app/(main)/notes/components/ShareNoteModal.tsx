"use client";

import { useState, useEffect } from "react";
import { X, Link2, Globe, Copy, Check, Loader2 } from "lucide-react";
import { NoteService, ApiNote } from "../services/note-service";

type Props = {
  noteId: string;
  noteTitle: string;
  onClose: () => void;
};

export default function ShareNoteModal({ noteId, noteTitle, onClose }: Props) {
  const [note, setNote] = useState<ApiNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  useEffect(() => {
    NoteService.getById(noteId)
      .then(setNote)
      .finally(() => setLoading(false));
  }, [noteId]);

  const internalUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/notes?note=${noteId}`;
  const publicUrl = note?.public_token
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/p/${note.public_token}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(internalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyPublic = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  const handleTogglePublic = async () => {
    if (!note) return;
    setToggling(true);
    try {
      const updated = await NoteService.togglePublic(noteId, !note.is_public);
      setNote(updated);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">Share</h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">{noteTitle || "Untitled"}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
            </div>
          ) : (
            <>
              {/* Copy internal link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 active:bg-slate-100 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <Link2 className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-700">Copy link</div>
                  <div className="text-xs text-slate-400">Internal link (requires login)</div>
                </div>
                {copiedLink
                  ? <Check className="w-4 h-4 text-green-500 shrink-0" />
                  : <Copy className="w-4 h-4 text-slate-300 shrink-0" />
                }
              </button>

              {/* Publish to web */}
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">Publish to web</div>
                    <div className="text-xs text-slate-400">Anyone with the link can view</div>
                  </div>
                  {/* Toggle */}
                  <button
                    onClick={handleTogglePublic}
                    disabled={toggling}
                    className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${note?.is_public ? "bg-blue-500" : "bg-slate-200"} ${toggling ? "opacity-50" : ""}`}
                    style={{ height: "22px", width: "40px" }}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform duration-200 ${note?.is_public ? "translate-x-[18px]" : ""}`}
                    />
                  </button>
                </div>

                {/* Public URL (shown only when published) */}
                {note?.is_public && publicUrl && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 truncate flex-1">{publicUrl}</span>
                      <button
                        onClick={handleCopyPublic}
                        className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-white border border-slate-200 hover:bg-slate-100 transition"
                      >
                        {copiedPublic
                          ? <><Check className="w-3 h-3 text-green-500" /> Copied</>
                          : <><Copy className="w-3 h-3 text-slate-500" /> Copy</>
                        }
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
