import type { SVGProps } from "react";

const DARK = "#6D28D9";
const LIGHT_FROM = "#C4B5FD";
const LIGHT_TO = "#8B5CF6";

type Props = SVGProps<SVGSVGElement>;

/** Same aspect ratio as FileTypeIcon's "doc"/"pdf" variants (0.8) and
 *  NoteFileIcon (NOTE_FILE_ICON_ASPECT) — keeps every peeking-icon type
 *  interchangeable in the same slot system. */
export const IMAGE_FILE_ICON_ASPECT = 0.8;

/** Photo glyph — same two-tone gradient + dark-accent page language as
 *  FileTypeIcon/NoteFileIcon, but in its own free color (violet) with a
 *  framed mountain-and-sun mark standing in for the folded-corner/spiral
 *  mark, so an image attachment reads as its own type at a glance instead
 *  of being lumped in with generic "doc". Forwards extra svg props onto the
 *  root <svg> so it can be nested/positioned the same way the other
 *  peeking-icon types are. */
export default function ImageFileIcon({ className, ...rest }: Props) {
  const gradId = "imageFileIconBody";
  const clipId = "imageFileIconFrameClip";

  return (
    <svg viewBox="0 0 160 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...rest}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={LIGHT_FROM} />
          <stop offset="100%" stopColor={LIGHT_TO} />
        </linearGradient>
        <clipPath id={clipId}>
          <rect x="36" y="28" width="88" height="88" rx="10" />
        </clipPath>
      </defs>

      {/* Page body */}
      <rect x="20" y="8" width="120" height="184" rx="16" fill={`url(#${gradId})`} />

      {/* Photo frame inset */}
      <rect x="36" y="28" width="88" height="88" rx="10" fill={DARK} fillOpacity="0.28" />
      <g clipPath={`url(#${clipId})`}>
        <circle cx="61" cy="53" r="10" fill="white" fillOpacity="0.85" />
        <path d="M36 116L59 81L77 100L94 75L124 108V116H36Z" fill="white" fillOpacity="0.85" />
      </g>

      {/* Caption lines below the frame */}
      <line x1="36" y1="136" x2="124" y2="136" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
      <line x1="36" y1="156" x2="90" y2="156" stroke="white" strokeOpacity="0.55" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
