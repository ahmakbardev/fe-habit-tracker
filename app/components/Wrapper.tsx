"use client";

export default function Wrapper({ children }: { children: React.ReactNode }) {
  return <div className="w-full h-full">{children}</div>;
}
