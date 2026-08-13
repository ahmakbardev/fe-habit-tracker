import type { SVGProps } from "react";

const DARK = "#B45309";
const LIGHT_FROM = "#FCD34D";
const LIGHT_TO = "#F59E0B";

type Props = SVGProps<SVGSVGElement>;

/** Same aspect ratio as FileTypeIcon's "doc"/"pdf" variants (0.8), so it
 *  drops into an existing peeking-file slot (e.g. FolderIcon's children,
 *  positioned via x/y/width/height) without any layout changes. */
export const NOTE_FILE_ICON_ASPECT = 0.8;

/** Notepad glyph — same two-tone gradient + dark-accent language as
 *  FileTypeIcon (pdf/xlsx/doc), but in its own free color (amber) with a
 *  spiral-binding row standing in for the folded-corner mark, so a linked
 *  Note reads as its own file type at a glance instead of being lumped in
 *  with generic "doc". Forwards extra svg props onto the root <svg> so it
 *  can be nested and positioned the same way FileTypeIcon is, e.g. inside
 *  FolderIcon's "files peeking out" composition. */
export default function NoteFileIcon({ className, ...rest }: Props) {
  const gradId = "noteFileIconBody";

  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LIGHT_FROM} />
          <stop offset="100%" stopColor={LIGHT_TO} />
        </linearGradient>
      </defs>

      {/* Page body */}
      <rect x="20" y="26" width="120" height="166" rx="16" fill={`url(#${gradId})`} />

      {/* Spiral-binding strip across the top */}
      <rect x="20" y="26" width="120" height="30" rx="16" fill={DARK} />
      <rect x="20" y="40" width="120" height="16" fill={DARK} />
      {[38, 62, 86, 110, 134].map((cx) => (
        <circle key={cx} cx={cx} cy="26" r="7" fill="white" />
      ))}
      {[38, 62, 86, 110, 134].map((cx) => (
        <circle key={`${cx}-hole`} cx={cx} cy="26" r="3.5" fill={DARK} />
      ))}

      {/* Note lines, each with a small bullet — distinguishes it from the
          plain text lines on the "doc" variant */}
      {[92, 116, 140].map((y) => (
        <circle key={`bullet-${y}`} cx="38" cy={y} r="5" fill="white" fillOpacity="0.6" />
      ))}
      <line x1="52" y1="92" x2="122" y2="92" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      <line x1="52" y1="116" x2="122" y2="116" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      <line x1="52" y1="140" x2="98" y2="140" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
