"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { venueConfig } from "@/config/modules/venue.config";
import { MapPin, Calendar, Clock, Timer, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingConfirmProps {
  venueName: string;
  date: string;
  startTime: string;
  duration: number;    // 分钟
  basePrice: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * 预约确认组件
 * 
 * 显示预约详情和须知
 */
export function BookingConfirm({
  venueName,
  date,
  startTime,
  duration,
  basePrice,
  onConfirm,
  onCancel,
  loading = false,
}: BookingConfirmProps) {
  const texts = venueConfig.texts;
  const bookingTips = venueConfig.bookingTips;
  const durationOptions = venueConfig.durationOptions;

  // 计算结束时间
  const endTime = useMemo(() => {
    const [hour, minute] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + duration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
  }, [startTime, duration]);

  // 计算价格
  const price = useMemo(() => {
    const option = durationOptions.find(o => o.minutes === duration);
    if (!option) return basePrice;
    return Math.round(basePrice * option.priceRatio - (option.discount || 0));
  }, [duration, basePrice, durationOptions]);

  // 格式化日期
  const formattedDate = useMemo(() => {
    const d = new Date(date);
    const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekDay = weekDays[d.getDay()];
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    let prefix = "";
    if (d.toDateString() === today.toDateString()) {
      prefix = "今天 ";
    } else if (d.toDateString() === tomorrow.toDateString()) {
      prefix = "明天 ";
    }
    
    return `${prefix}${month}月${day}日 ${weekDay}`;
  }, [date]);

  // 格式化时长
  const formattedDuration = useMemo(() => {
    if (duration >= 60) {
      const hours = duration / 60;
      return hours % 1 === 0 ? `${hours}小时` : `${hours}小时`;
    }
    return `${duration}分钟`;
  }, [duration]);

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-base">✅ 请确认预约信息</h3>
      
      {/* 预约详情卡片 */}
      <div className="bg-muted/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div>
            <div className="font-semibold">{venueName}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="font-medium">{formattedDate}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="font-medium">{startTime} - {endTime}</div>
        </div>
        
        <div className="flex items-center gap-3">
          <Timer className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="font-medium">{formattedDuration}</div>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">费用</span>
            <span className="text-xl font-bold text-primary">¥{price}</span>
          </div>
        </div>
      </div>
      
      {/* 预约须知 */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium text-sm">预约须知</span>
        </div>
        <ul className="space-y-1">
          {bookingTips.map((tip, index) => (
            <li key={index} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <span>•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          返回修改
        </Button>
        <Button
          className="flex-1"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "提交中..." : `确认预约 ¥${price}`}
        </Button>
      </div>
    </div>
  );
}
