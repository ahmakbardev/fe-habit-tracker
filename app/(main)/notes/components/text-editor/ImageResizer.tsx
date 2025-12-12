// app/(main)/notes/components/text-editor/ImageResizer.tsx
import React, { useEffect, useState, useCallback } from "react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

type Props = {
  editorRef: React.RefObject<HTMLDivElement>;
  selectedImage: HTMLImageElement | null;
  setSelectedImage: (img: HTMLImageElement | null) => void;
  onResizeEnd: () => void;
};

export default function ImageResizer({
  editorRef,
  selectedImage,
//   setSelectedImage,
  onResizeEnd,
}: Props) {
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // --- KALKULASI POSISI ---
  const updateOverlayPosition = useCallback(() => {
    // Container relative adalah parent dari editorRef
    const container = editorRef.current?.parentElement;
    if (!selectedImage || !container) return;

    const containerRect = container.getBoundingClientRect();
    const imgRect = selectedImage.getBoundingClientRect();

    setPosition({
      top: imgRect.top - containerRect.top,
      left: imgRect.left - containerRect.left,
      width: imgRect.width,
      height: imgRect.height,
    });
  }, [selectedImage, editorRef]);

  // --- LISTENERS (FIX RESIZER LARI) ---
  useEffect(() => {
    if (!selectedImage) return;

    updateOverlayPosition();

    // 1. Listen window resize
    window.addEventListener("resize", updateOverlayPosition);

    // 2. Listen scroll pada editor
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("scroll", updateOverlayPosition);
      // 3. PENTING: Listen input/typing agar overlay ikut bergerak saat text mendorong gambar
      editor.addEventListener("input", updateOverlayPosition);
      editor.addEventListener("keyup", updateOverlayPosition);
      editor.addEventListener("click", updateOverlayPosition);
    }

    // 4. MutationObserver untuk catch layout changes yang tidak terduga
    const observer = new MutationObserver(updateOverlayPosition);
    if (editor)
      observer.observe(editor, {
        childList: true,
        subtree: true,
        attributes: true,
      });

    return () => {
      window.removeEventListener("resize", updateOverlayPosition);
      if (editor) {
        editor.removeEventListener("scroll", updateOverlayPosition);
        editor.removeEventListener("input", updateOverlayPosition);
        editor.removeEventListener("keyup", updateOverlayPosition);
        editor.removeEventListener("click", updateOverlayPosition);
      }
      observer.disconnect();
    };
  }, [selectedImage, editorRef, updateOverlayPosition]);

  // --- HANDLER ALIGNMENT ---
  const handleAlign = (alignment: "start" | "center" | "end") => {
    if (!selectedImage) return;
    const parent = selectedImage.parentElement;
    if (!parent) return;

    // Reset & Set Class Flex
    parent.classList.remove("justify-start", "justify-center", "justify-end");
    parent.classList.add(`justify-${alignment}`);

    onResizeEnd();
    // Force update visual segera
    requestAnimationFrame(updateOverlayPosition);
  };

  // --- HANDLER RESIZE ---
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = selectedImage ? selectedImage.clientWidth : 0;
    const container = editorRef.current?.parentElement;

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!selectedImage || !container) return;

      const currentX = moveEvent.clientX;
      const diffX = currentX - startX;
      let newWidth = startWidth + diffX;

      const maxWidth = container.clientWidth - 40;
      if (newWidth < 50) newWidth = 50;
      if (newWidth > maxWidth) newWidth = maxWidth;

      selectedImage.style.width = `${newWidth}px`;

      // Update overlay sync saat drag
      const imgRect = selectedImage.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setPosition({
        top: imgRect.top - containerRect.top,
        left: imgRect.left - containerRect.left,
        width: newWidth,
        height: imgRect.height,
      });
    };

    const onMouseUp = () => {
      onResizeEnd();
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  if (!selectedImage) return null;

  return (
    <div
      className="absolute border-2 border-blue-500 pointer-events-none z-50 transition-none" // transition-none biar gesit
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        height: position.height,
        display: position.width === 0 ? "none" : "block",
      }}
    >
      {/* Toolbar Alignment */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white shadow-md border rounded flex p-1 pointer-events-auto gap-1">
        <button
          onClick={() => handleAlign("start")}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <AlignLeft size={16} />
        </button>
        <button
          onClick={() => handleAlign("center")}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <AlignCenter size={16} />
        </button>
        <button
          onClick={() => handleAlign("end")}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <AlignRight size={16} />
        </button>
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nwse-resize pointer-events-auto shadow-sm"
      />
    </div>
  );
}
