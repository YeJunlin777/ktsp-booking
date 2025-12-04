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

// 图标映射表（从配置的字符串映射到实际图标）
const iconMap: Record<string, LucideIcon> = {
  Home,
  CalendarDays,
  Gift,
  User,
};

export function BottomNav() {
  const pathname = usePathname();
  const navItems = useBottomNav(); // 从配置读取

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around">
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
                "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* 底部安全区域 */}
      <div className="h-safe-area-inset-bottom bg-background" />
    </nav>
  );
}
