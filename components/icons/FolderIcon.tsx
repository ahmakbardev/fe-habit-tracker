import type { ReactNode } from "react";

type Props = {
  className?: string;
  /** Rendered between the back tab and the front flap — e.g. file icons
   *  "peeking out" of the folder, clipped by the front flap drawn on top. */
  children?: ReactNode;
};

/** Two-tone flat folder glyph — back tab + gradient front flap. */
export default function FolderIcon({ className, children }: Props) {
  return (
    <svg
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="folderIconFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M20 40C20 30.0589 28.0589 22 38 22H84C88.8 22 93.3 24.2 96.3 28.1L104 38.2C106.4 41.3 110.1 43 114 43H180C189.941 43 198 51.0589 198 61V152C198 161.941 189.941 170 180 170H38C28.0589 170 20 161.941 20 152V40Z"
        fill="#1D4ED8"
      />
      {children}
      <path
        d="M20 76C20 67.1634 27.1634 60 36 60H182C190.837 60 198 67.1634 198 76V152C198 161.941 189.941 170 180 170H38C28.0589 170 20 161.941 20 152V76Z"
        fill="url(#folderIconFront)"
      />
      <path
        d="M20 76C20 67.1634 27.1634 60 36 60H182C190.837 60 198 67.1634 198 76V80H20V76Z"
        fill="white"
        fillOpacity="0.15"
      />
    </svg>
  );
}
