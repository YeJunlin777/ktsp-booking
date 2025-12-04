"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 日历日期项
 */
interface CalendarDay {
  day: number;
  isChecked: boolean;
  isToday: boolean;
}

/**
 * 签到日历组件 Props
 */
export interface CheckinCalendarProps {
  /** 已签到的日期列表 (格式: YYYY-MM-DD) */
  checkedDates: string[];
  /** 当前是否已签到（用于今日显示） */
  isTodayChecked?: boolean;
  /** 自定义类名 */
  className?: string;
}

/**
 * 签到日历组件
 * 
 * 【职责】展示本月签到日历
 * 【复用】通过props传入已签到日期
 */
export function CheckinCalendar({
  checkedDates,
  isTodayChecked = false,
  className,
}: CheckinCalendarProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  // 生成日历数据
  const calendarDays = useMemo<CalendarDay[]>(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days: CalendarDay[] = [];

    // 填充月初空白
    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: 0, isChecked: false, isToday: false });
    }

    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isToday = day === today.getDate();
      const isChecked = checkedDates.includes(dateStr) || (isToday && isTodayChecked);
      
      days.push({ day, isChecked, isToday });
    }

    return days;
  }, [year, month, checkedDates, isTodayChecked, today]);

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          {month + 1}月签到记录
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 星期标题 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* 日历格子 */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, index) => (
            <div
              key={index}
              className={cn(
                "aspect-square flex items-center justify-center rounded-md text-sm",
                item.day === 0 && "invisible",
                item.isToday && "ring-2 ring-primary",
                item.isChecked && "bg-primary text-primary-foreground",
                !item.isChecked && item.day > 0 && "bg-muted"
              )}
            >
              {item.day > 0 &&
                (item.isChecked ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  item.day
                ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
