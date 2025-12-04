import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 主内容区域，底部留出导航栏空间 */}
      <main className="pb-20">{children}</main>
      
      {/* 底部导航 */}
      <BottomNav />
    </div>
  );
}
