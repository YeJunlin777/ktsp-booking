import { BottomNav } from "@/components/layout/bottom-nav";
import { TopNav } from "@/components/layout/top-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* 桌面端顶部导航（仅 md 以上显示） */}
      <TopNav />
      
      {/* 主内容区域 */}
      {/* 手机端：底部留空间给导航栏 */}
      {/* 电脑端：居中容器 + 无底部留空 */}
      <main className="pb-20 md:pb-0 md:max-w-4xl md:mx-auto">
        {children}
      </main>
      
      {/* 底部导航（仅手机端显示） */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
