"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, CalendarDays, Gift, ShoppingBag, Ticket, Bell, UserPlus, MessageSquare, Settings, type LucideIcon } from "lucide-react";
import { memberConfig } from "@/config";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  CalendarDays,
  Gift,
  ShoppingBag,
  Ticket,
  Bell,
  UserPlus,
  MessageSquare,
  Settings,
};

interface MenuListProps {
  className?: string;
}

/**
 * 个人中心菜单列表组件
 * 
 * 【职责】展示功能入口菜单
 * 【配置化】菜单项从配置读取
 */
export function MenuList({ className }: MenuListProps) {
  const { menuItems } = memberConfig;

  return (
    <Card className={cn(className)}>
      <CardContent className="p-0 divide-y">
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || CalendarDays;
          
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 transition-colors"
            >
              <Icon className="w-5 h-5 text-muted-foreground" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
