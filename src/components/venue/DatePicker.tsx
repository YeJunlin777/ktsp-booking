"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { venueConfig } from "@/config";

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  className?: string;
}

/**
 * 日期选择组件（横向滚动）
 * 
 * 【职责】选择预约日期
 * 【配置化】可预约天数从配置读取
 */
export function DatePicker({
  selectedDate,
  onDateChange,
  className,
}: DatePickerProps) {
  const { advanceBookingDays } = venueConfig.rules;

  // 生成可选日期列表
  const dateList = useMemo(() => {
    const dates: { date: string; day: number; weekday: string; isToday: boolean }[] = [];
    const today = new Date();
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

    for (let i = 0; i < advanceBookingDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split("T")[0];
      dates.push({
        date: dateStr,
        day: date.getDate(),
        weekday: i === 0 ? "今天" : i === 1 ? "明天" : weekdays[date.getDay()],
        isToday: i === 0,
      });
    }

    return dates;
  }, [advanceBookingDays]);

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-medium">{venueConfig.texts.selectDateText}</h3>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dateList.map((item) => (
          <button
            key={item.date}
            onClick={() => onDateChange(item.date)}
            className={cn(
              "flex-shrink-0 flex flex-col items-center w-14 py-2 rounded-lg border transition-all",
              selectedDate === item.date
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary/50"
            )}
          >
            <span className="text-xs">{item.weekday}</span>
            <span className="text-lg font-semibold">{item.day}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
