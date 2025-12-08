import Topbar from "@/app/components/Topbar";
import FloatingMenu from "@/app/components/FloatingMenu";
import PageContainer from "@/app/components/PageContainer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col flex-1">
        <Topbar />

        <PageContainer>{children}</PageContainer>

        <FloatingMenu />
      </div>
    </div>
  );
}
