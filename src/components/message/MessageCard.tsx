"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Calendar, Gift, UserPlus, Settings, type LucideIcon } from "lucide-react";
import { messageConfig } from "@/config";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  Bell,
  Calendar,
  Gift,
  UserPlus,
  Settings,
};

interface MessageCardProps {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  className?: string;
}

/**
 * 消息卡片组件
 * 
 * 【职责】展示单条消息
 * 【配置化】图标颜色从配置读取
 */
export function MessageCard({
  id,
  type,
  title,
  content,
  isRead,
  createdAt,
  className,
}: MessageCardProps) {
  // 获取类型配置
  const typeConfig = messageConfig.types.find((t) => t.key === type);
  const Icon = iconMap[typeConfig?.icon || "Bell"] || Bell;
  const colorClass = messageConfig.iconColors[type as keyof typeof messageConfig.iconColors] 
    || "bg-gray-100 text-gray-600";

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return messageConfig.texts.justNow;
    if (diffMinutes < 60) return messageConfig.texts.minutesAgo.replace("{n}", String(diffMinutes));
    if (diffHours < 24) return messageConfig.texts.hoursAgo.replace("{n}", String(diffHours));
    if (diffDays < 30) return messageConfig.texts.daysAgo.replace("{n}", String(diffDays));
    
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}月${day}日`;
  };

  return (
    <Link href={`/messages/${id}`}>
      <Card className={cn(
        "transition-colors hover:bg-muted/50",
        !isRead && "bg-primary/5 border-primary/20",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* 图标 */}
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
              <Icon className="w-5 h-5" />
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className={cn("font-medium truncate", !isRead && "font-semibold")}>
                  {title}
                </h3>
                {!isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {formatTime(createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
