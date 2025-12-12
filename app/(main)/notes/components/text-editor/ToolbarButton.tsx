// app/(main)/notes/components/text-editor/ToolbarButton.tsx

export default function ToolbarButton({
  icon,
  onClick,
}: {
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-1 hover:bg-slate-100 rounded transition"
    >
      {icon}
    </button>
  );
}
