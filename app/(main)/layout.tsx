import Topbar from "@/app/components/Topbar";
import FloatingMenu from "@/app/components/FloatingMenu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Topbar />

      <div className="flex-1 relative overflow-hidden flex">
        {children}
      </div>

      <FloatingMenu />
    </div>
  );
}
