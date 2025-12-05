"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { homeConfig, type CategoryItem } from "@/config";
import {
  Target,
  Monitor,
  Flag,
  Crown,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  target: Target,
  monitor: Monitor,
  flag: Flag,
  crown: Crown,
  "user-check": UserCheck,
  users: Users,
};

interface CategoryNavProps {
  categories?: CategoryItem[];
  className?: string;
}

/**
 * 场地分类导航
 * 
 * 【职责】展示场地分类快捷入口
 * 【配置化】分类项从配置读取
 */
export function CategoryNav({ 
  categories = homeConfig.categories, 
  className 
}: CategoryNavProps) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {categories.map((category) => {
        const Icon = iconMap[category.icon] || Target;
        
        return (
          <Link
            key={category.key}
            href={category.path}
            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card hover:bg-accent transition-colors"
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white",
              category.color
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">{category.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
