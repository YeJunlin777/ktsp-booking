"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { reviewConfig } from "@/config";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

/**
 * 星级评分组件
 * 
 * 【职责】展示和选择星级评分
 * 【配置化】最大星数和标签从配置读取
 */
export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
  showLabel = true,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const { max, labels } = reviewConfig.rating;

  const displayValue = hoverValue || value;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {[...Array(max)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayValue;

          return (
            <button
              key={index}
              type="button"
              disabled={readonly}
              onClick={() => onChange?.(starValue)}
              onMouseEnter={() => !readonly && setHoverValue(starValue)}
              onMouseLeave={() => !readonly && setHoverValue(0)}
              className={cn(
                "transition-colors",
                readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300"
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel && displayValue > 0 && (
        <span className="text-sm text-muted-foreground">
          {labels[displayValue - 1]}
        </span>
      )}
    </div>
  );
}
