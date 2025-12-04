"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  CalendarDays,
  Users,
  UserCog,
  Gift,
  ShoppingBag,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { href: "/admin", label: "控制台", icon: LayoutDashboard },
  { href: "/admin/venues", label: "场地管理", icon: MapPin },
  { href: "/admin/bookings", label: "预约管理", icon: CalendarDays },
  { href: "/admin/coaches", label: "教练管理", icon: UserCog },
  { href: "/admin/members", label: "会员管理", icon: Users },
  { href: "/admin/points", label: "积分规则", icon: Gift },
  { href: "/admin/products", label: "积分商城", icon: ShoppingBag },
  { href: "/admin/coupons", label: "优惠券", icon: Ticket },
  { href: "/admin/stats", label: "数据统计", icon: BarChart3 },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            K
          </div>
          <span className="text-lg font-semibold">KTSP管理后台</span>
        </Link>
      </div>

      {/* 菜单 */}
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 底部退出按钮 */}
      <div className="absolute bottom-0 left-0 right-0 border-t p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          退出登录
        </button>
      </div>
    </aside>
  );
}
