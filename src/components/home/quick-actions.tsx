"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { homeConfig, type QuickActionItem } from "@/config";
import {
  CalendarCheck,
  Coins,
  Ticket,
  Bell,
  type LucideIcon,
} from "lucide-react";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  "calendar-check": CalendarCheck,
  coins: Coins,
  ticket: Ticket,
  bell: Bell,
};

interface QuickActionsProps {
  actions?: QuickActionItem[];
  className?: string;
  // 可选：显示未读消息数
  messageCount?: number;
}

/**
 * 快捷操作入口
 * 
 * 【职责】展示快捷功能入口
 * 【配置化】操作项从配置读取
 */
export function QuickActions({ 
  actions = homeConfig.quickActions, 
  className,
  messageCount = 0,
}: QuickActionsProps) {
  return (
    <div className={cn("flex justify-around py-2", className)}>
      {actions.map((action) => {
        const Icon = iconMap[action.icon] || CalendarCheck;
        const showBadge = action.key === "messages" && messageCount > 0;
        
        return (
          <Link
            key={action.key}
            href={action.path}
            className="flex flex-col items-center gap-1 relative"
          >
            <div className="relative">
              <Icon className="w-6 h-6 text-muted-foreground" />
              {showBadge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {messageCount > 9 ? "9+" : messageCount}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
