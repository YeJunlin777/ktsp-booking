"use client";

import { cn } from "@/lib/utils";
import { messageConfig } from "@/config";

interface MessageTabsProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  unreadCounts?: Record<string, number>;
  className?: string;
}

/**
 * 消息类型标签组件
 * 
 * 【职责】消息类型筛选
 * 【配置化】类型列表从配置读取
 */
export function MessageTabs({
  activeType,
  onTypeChange,
  unreadCounts = {},
  className,
}: MessageTabsProps) {
  const { types, rules } = messageConfig;

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {types.map((type) => {
        const unreadCount = type.key === "all" 
          ? Object.values(unreadCounts).reduce((sum, count) => sum + count, 0)
          : unreadCounts[type.key] || 0;
        
        const showBadge = rules.showBadge && unreadCount > 0;
        const displayCount = unreadCount > rules.maxBadgeCount 
          ? `${rules.maxBadgeCount}+` 
          : unreadCount;

        return (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={cn(
              "relative flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeType === type.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            {type.label}
            {showBadge && (
              <span className={cn(
                "absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full text-xs flex items-center justify-center",
                activeType === type.key
                  ? "bg-background text-primary"
                  : "bg-primary text-primary-foreground"
              )}>
                {displayCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
