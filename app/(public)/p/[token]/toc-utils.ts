export interface Heading {
  id: string;
  text: string;
  level: number;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(text: string, used: Map<string, number>): string {
  const base =
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "section";

  const count = used.get(base) ?? 0;
  used.set(base, count + 1);
  return count === 0 ? base : `${base}-${count}`;
}

/**
 * Extracts h1-h3 headings from editor-generated HTML, assigns each a stable
 * id, and injects that id into the returned HTML so anchor links work.
 */
export function processContent(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const used = new Map<string, number>();

  const withHeadingIds = html.replace(
    /<h([1-3])([^>]*)>([\s\S]*?)<\/h\1>/g,
    (match, levelStr, attrs, inner) => {
      const text = stripTags(inner);
      if (!text) return match;

      const id = slugify(text, used);
      headings.push({ id, text, level: Number(levelStr) });

      const cleanedAttrs = attrs.replace(/\sid="[^"]*"/, "");
      return `<h${levelStr}${cleanedAttrs} id="${id}">${inner}</h${levelStr}>`;
    }
  );

  // Tables inserted via the editor's own table command already carry an
  // "overflow-x-auto" wrapper; only wrap the ones that don't (e.g. older
  // notes, or tables from other content sources) to avoid double-wrapping.
  const withScrollableTables = withHeadingIds.replace(
    /(<div[^>]*class="[^"]*overflow-x-auto[^"]*"[^>]*>\s*)?(<table[\s\S]*?<\/table>)(\s*<\/div>)?/g,
    (match, openDiv, table, closeDiv) => {
      if (openDiv && closeDiv) return match;
      return `<div class="overflow-x-auto my-4">${table}</div>`;
    }
  );

  return { html: withScrollableTables, headings };
}
