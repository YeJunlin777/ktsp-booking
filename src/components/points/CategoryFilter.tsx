"use client";

import { cn } from "@/lib/utils";
import { pointsConfig } from "@/config";

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

/**
 * 商品分类筛选组件
 * 
 * 【职责】商品分类筛选
 * 【配置化】分类列表从配置读取
 */
export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  const { productCategories } = pointsConfig;

  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2", className)}>
      {productCategories.map((category) => (
        <button
          key={category.key}
          onClick={() => onCategoryChange(category.key)}
          className={cn(
            "flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === category.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
