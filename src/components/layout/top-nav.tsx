"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useBottomNav } from "@/hooks/use-config";
import {
  Home,
  CalendarDays,
  Gift,
  User,
  LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Home,
  CalendarDays,
  Gift,
  User,
};

/**
 * 桌面端顶部导航
 * 
 * 【显示条件】仅在 md (768px) 以上显示
 * 【手机端】完全隐藏，不影响
 */
export function TopNav() {
  const pathname = usePathname();
  const navItems = useBottomNav();

  return (
    <nav className="hidden md:block sticky top-0 z-50 border-b bg-background">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-bold text-xl text-primary">
            KTSP
          </Link>

          {/* 导航项 */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              
              const Icon = iconMap[item.icon] || Home;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
