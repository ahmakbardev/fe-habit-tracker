// app/(main)/notes/components/text-editor/ToolbarButton.tsx

export default function ToolbarButton({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="p-1 hover:bg-slate-100 rounded transition"
      title={title}
    >
      {icon}
    </button>
  );
}
