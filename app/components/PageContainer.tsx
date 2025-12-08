"use client";

export default function PageContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="flex-1 p-6 overflow-y-auto">{children}</main>;
}
