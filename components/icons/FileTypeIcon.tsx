import type { SVGProps } from "react";

type Variant = "pdf" | "xlsx" | "doc";

const COLORS: Record<Variant, { dark: string; lightFrom: string; lightTo: string }> = {
  pdf: { dark: "#B91C1C", lightFrom: "#F87171", lightTo: "#EF4444" },
  xlsx: { dark: "#15803D", lightFrom: "#4ADE80", lightTo: "#22C55E" },
  doc: { dark: "#1D4ED8", lightFrom: "#60A5FA", lightTo: "#3B82F6" },
};

type Props = {
  variant: Variant;
} & SVGProps<SVGSVGElement>;

/** File-type glyphs — same two-tone gradient + dark-accent language as
 *  FolderIcon, but each variant gets its own silhouette and a distinguishing
 *  mark instead of just a recolor: PDF is a folded page with text lines,
 *  DOC is a flat page with a title block, XLSX is a spreadsheet grid.
 *  Forwards any extra svg props (x/y/width/height/style/...) onto the root
 *  <svg> so it can be nested and positioned inside another icon, e.g.
 *  FolderIcon's "files peeking out" composition. */
export default function FileTypeIcon({ variant, className, ...rest }: Props) {
  const { dark, lightFrom, lightTo } = COLORS[variant];
  const gradId = `fileTypeIconBody-${variant}`;

  if (variant === "xlsx") {
    return (
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lightFrom} />
            <stop offset="100%" stopColor={lightTo} />
          </linearGradient>
        </defs>
        <rect x="12" y="12" width="136" height="136" rx="20" fill={`url(#${gradId})`} />
        <rect x="12" y="12" width="136" height="34" rx="20" fill={dark} />
        <rect x="12" y="28" width="136" height="18" fill={dark} />
        <line x1="12" y1="80" x2="148" y2="80" stroke="white" strokeOpacity="0.5" strokeWidth="4" />
        <line x1="12" y1="114" x2="148" y2="114" stroke="white" strokeOpacity="0.5" strokeWidth="4" />
        <line x1="58" y1="46" x2="58" y2="148" stroke="white" strokeOpacity="0.5" strokeWidth="4" />
        <line x1="104" y1="46" x2="104" y2="148" stroke="white" strokeOpacity="0.5" strokeWidth="4" />
      </svg>
    );
  }

  if (variant === "doc") {
    return (
      <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lightFrom} />
            <stop offset="100%" stopColor={lightTo} />
          </linearGradient>
        </defs>
        <rect x="20" y="8" width="120" height="184" rx="16" fill={`url(#${gradId})`} />
        <rect x="36" y="30" width="64" height="16" rx="8" fill={dark} />
        <line x1="36" y1="76" x2="124" y2="76" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
        <line x1="36" y1="96" x2="124" y2="96" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
        <line x1="36" y1="116" x2="124" y2="116" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
        <line x1="36" y1="136" x2="90" y2="136" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lightFrom} />
          <stop offset="100%" stopColor={lightTo} />
        </linearGradient>
      </defs>
      <path
        d="M34 8H88L140 60V178A14 14 0 0 1 126 192H34A14 14 0 0 1 20 178V22A14 14 0 0 1 34 8Z"
        fill={`url(#${gradId})`}
      />
      <path d="M88 8L140 60H100A12 12 0 0 1 88 48V8Z" fill={dark} />
      <line x1="36" y1="110" x2="124" y2="110" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      <line x1="36" y1="130" x2="124" y2="130" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      <line x1="36" y1="150" x2="94" y2="150" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
