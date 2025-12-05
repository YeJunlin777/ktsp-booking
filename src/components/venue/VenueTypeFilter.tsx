"use client";

import { cn } from "@/lib/utils";
import { venueConfig } from "@/config";
import { Target, Monitor, Flag, Crown, type LucideIcon } from "lucide-react";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  target: Target,
  monitor: Monitor,
  flag: Flag,
  crown: Crown,
};

interface VenueTypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  className?: string;
}

/**
 * 场地类型筛选组件
 * 
 * 【职责】场地类型筛选
 * 【配置化】类型列表从配置读取
 */
export function VenueTypeFilter({
  selectedType,
  onTypeChange,
  className,
}: VenueTypeFilterProps) {
  const { venueTypes } = venueConfig;

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {/* 全部 */}
      <button
        onClick={() => onTypeChange(null)}
        className={cn(
          "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
          selectedType === null
            ? "bg-primary text-primary-foreground"
            : "bg-muted hover:bg-muted/80"
        )}
      >
        全部
      </button>

      {/* 各类型 */}
      {venueTypes.map((type) => {
        const Icon = iconMap[type.icon] || Target;
        const isSelected = selectedType === type.key;

        return (
          <button
            key={type.key}
            onClick={() => onTypeChange(type.key)}
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
          >
            <Icon className="w-4 h-4" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
