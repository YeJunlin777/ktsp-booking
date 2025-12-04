import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* 侧边栏 */}
      <AdminSidebar />
      
      {/* 主内容区域 */}
      <main className="ml-64 min-h-screen">
        {/* 顶栏 */}
        <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <h1 className="text-lg font-medium">KTSP管理系统</h1>
            {/* 可以添加用户头像、通知等 */}
          </div>
        </header>
        
        {/* 页面内容 */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
