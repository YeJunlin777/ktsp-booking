"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { venueConfig } from "@/config/modules/venue.config";

interface BookingDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  availableSlotsByDate?: Record<string, number>; // 每天可用时段数
}

/**
 * 预约日期选择器
 * 
 * 横向滚动选择日期，简洁紧凑
 */
export function BookingDatePicker({
  selectedDate,
  onDateChange,
}: BookingDatePickerProps) {
  const texts = venueConfig.texts;
  const rules = venueConfig.rules;

  // 生成日期列表
  const dates = useMemo(() => {
    const result: {
      date: string;
      dayLabel: string;
      dateLabel: string;
    }[] = [];

    const today = new Date();
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    for (let i = 0; i < rules.advanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split("T")[0];
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekDay = weekDays[date.getDay()];
      
      // 今天/明天/后天 显示特殊标签
      let dayLabel = weekDay;
      if (i === 0) dayLabel = "今天";
      else if (i === 1) dayLabel = "明天";
      else if (i === 2) dayLabel = "后天";
      
      result.push({
        date: dateStr,
        dayLabel,
        dateLabel: `${month}/${day}`,
      });
    }

    return result;
  }, [rules.advanceBookingDays]);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-base">{texts.selectDateText}</h3>
      
      {/* 横向滚动日期选择 */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {dates.map((item) => {
          const isSelected = selectedDate === item.date;
          
          return (
            <button
              key={item.date}
              onClick={() => onDateChange(item.date)}
              className={cn(
                "flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all",
                "flex flex-col items-center min-w-[72px]",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border hover:border-primary/50 bg-background"
              )}
            >
              <div className={cn(
                "text-sm",
                isSelected ? "text-primary-foreground" : "text-muted-foreground"
              )}>
                {item.dayLabel}
              </div>
              <div className={cn(
                "font-semibold text-lg",
                isSelected ? "text-primary-foreground" : "text-foreground"
              )}>
                {item.dateLabel}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
