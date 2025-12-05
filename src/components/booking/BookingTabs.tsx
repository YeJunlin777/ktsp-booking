"use client";

import { cn } from "@/lib/utils";
import { bookingConfig } from "@/config";

interface BookingTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

/**
 * 预约列表标签页组件
 * 
 * 【职责】预约状态筛选
 * 【配置化】标签列表从配置读取
 */
export function BookingTabs({
  activeTab,
  onTabChange,
  className,
}: BookingTabsProps) {
  const { tabs } = bookingConfig.list;

  return (
    <div className={cn("flex border-b", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={cn(
            "flex-1 py-3 text-sm font-medium transition-colors relative",
            activeTab === tab.key
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.key && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
