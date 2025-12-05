"use client";

import { cn } from "@/lib/utils";
import { couponConfig } from "@/config";

interface CouponTabsProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  counts?: Record<string, number>;
  className?: string;
}

/**
 * 优惠券筛选标签组件
 * 
 * 【职责】优惠券状态筛选
 * 【配置化】类型列表从配置读取
 */
export function CouponTabs({
  activeType,
  onTypeChange,
  counts = {},
  className,
}: CouponTabsProps) {
  const { types } = couponConfig;

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {types.map((type) => {
        const count = type.key === "all" 
          ? Object.values(counts).reduce((sum, c) => sum + c, 0)
          : counts[type.key] || 0;

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
            {count > 0 && (
              <span className="ml-1">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
