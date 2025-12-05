"use client";

import { cn } from "@/lib/utils";
import { venueConfig } from "@/config/modules/venue.config";

interface DurationOption {
  minutes: number;
  label: string;
  shortLabel: string;
  priceRatio: number;
  discount: number;
  recommended?: boolean;
}

interface DurationPickerProps {
  basePrice: number;            // 基础价格（1小时）
  selectedDuration: number;     // 选中的时长（分钟）
  onDurationChange: (minutes: number) => void;
}

/**
 * 时长选择器组件
 * 
 * 显示可选的预约时长，带价格和折扣信息
 */
export function DurationPicker({
  basePrice,
  selectedDuration,
  onDurationChange,
}: DurationPickerProps) {
  const options = venueConfig.durationOptions as DurationOption[];
  const texts = venueConfig.texts;

  // 计算价格
  const calculatePrice = (option: DurationOption) => {
    const price = basePrice * option.priceRatio - option.discount;
    return Math.round(price);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-base">{texts.selectDurationText}</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const price = calculatePrice(option);
          const isSelected = selectedDuration === option.minutes;
          
          return (
            <button
              key={option.minutes}
              onClick={() => onDurationChange(option.minutes)}
              className={cn(
                "relative p-3 rounded-xl border-2 transition-all",
                "flex flex-col items-center justify-center gap-1",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {/* 时长 */}
              <span className={cn(
                "text-lg font-semibold",
                isSelected ? "text-primary" : "text-foreground"
              )}>
                {option.shortLabel}
              </span>
              
              {/* 价格 */}
              <span className={cn(
                "text-sm",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                ¥{price}
              </span>
              
              {/* 折扣标签 */}
              {option.discount > 0 && (
                <span className="text-xs text-green-600 font-medium">
                  {texts.saveTip}¥{option.discount}
                </span>
              )}
              
              {/* 选中指示器 */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
