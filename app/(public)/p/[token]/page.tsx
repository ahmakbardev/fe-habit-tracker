import type { Metadata } from "next";
import Link from "next/link";

interface PublicNote {
  id: string;
  title: string;
  content: unknown;
  plain_text_preview: string;
  updated_at: string;
}

async function getPublicNote(token: string): Promise<PublicNote | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${base}/public/notes/${token}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

function extractHtml(content: unknown, fallback: string): string {
  if (typeof content === "string") return content;
  if (content && typeof content === "object") {
    const c = content as { html?: string };
    if (c.html) return c.html;
  }
  return fallback || "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const note = await getPublicNote(token);
  return {
    title: note ? `${note.title || "Untitled"} — HabitFlow` : "Note Not Found — HabitFlow",
    description: note?.plain_text_preview?.slice(0, 160) || "",
  };
}

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const note = await getPublicNote(token);

  if (!note) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="flex items-center gap-2 mb-8">
          <img src="/icons/favicon.svg" alt="HabitFlow" className="w-5 h-5" />
          <span className="text-sm font-semibold text-slate-500">HabitFlow</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Note not found</h1>
        <p className="text-slate-400 text-sm">This note may not exist or has been made private.</p>
      </div>
    );
  }

  const html = extractHtml(note.content, note.plain_text_preview);
  const updatedAt = new Date(note.updated_at).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Branded topbar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-3 flex items-center gap-2">
        <img src="/icons/favicon.svg" alt="HabitFlow" className="w-5 h-5" />
        <span className="text-sm font-semibold text-slate-500">HabitFlow</span>
      </header>

      {/* Note content */}
      <main className="max-w-[720px] mx-auto px-8 py-12">
        <h1 className="text-4xl font-extrabold text-slate-900 leading-tight mb-2">
          {note.title || "Untitled"}
        </h1>
        <p className="text-xs text-slate-400 mb-10">Updated {updatedAt}</p>

        {html ? (
          <div
            className="note-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <p className="text-slate-400 italic">This note is empty.</p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-4 text-center">
        <span className="text-xs text-slate-400">
          Made with{" "}
          <Link href="/" className="text-blue-500 hover:underline">
            HabitFlow
          </Link>
        </span>
      </footer>
    </div>
  );
}
