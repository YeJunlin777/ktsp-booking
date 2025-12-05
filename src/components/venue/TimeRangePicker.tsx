"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { venueConfig } from "@/config/modules/venue.config";
import { AlertCircle } from "lucide-react";

interface BookedSlot {
  startTime: string;
  endTime: string;
  userName?: string;
}

interface TimeRangePickerProps {
  date: string;                    // 选择的日期
  duration: number;                // 选择的时长（分钟）
  basePrice: number;               // 基础价格（1小时）
  bookedSlots: BookedSlot[];       // 已被预约的时段
  selectedTimeRange: string | null; // 选中的时间段起始时间
  onTimeRangeChange: (startTime: string | null) => void;
}

/**
 * 时间段选择器组件
 * 
 * 显示可选的时间段，支持冲突检测
 */
export function TimeRangePicker({
  date,
  duration,
  basePrice,
  bookedSlots,
  selectedTimeRange,
  onTimeRangeChange,
}: TimeRangePickerProps) {
  const texts = venueConfig.texts;
  const timeSlots = venueConfig.timeSlots;
  const durationOptions = venueConfig.durationOptions;
  
  // 显示冲突详情的弹窗
  const [conflictInfo, setConflictInfo] = useState<{
    timeRange: string;
    conflicts: BookedSlot[];
  } | null>(null);

  // 计算价格
  const price = useMemo(() => {
    const option = durationOptions.find(o => o.minutes === duration);
    if (!option) return basePrice;
    return Math.round(basePrice * option.priceRatio - (option.discount || 0));
  }, [duration, basePrice, durationOptions]);

  // 生成所有可能的时间段
  const timeRanges = useMemo(() => {
    const ranges: {
      startTime: string;
      endTime: string;
      period: "morning" | "afternoon" | "evening";
      available: boolean;
      isPast: boolean;  // 是否已过期
      conflicts: BookedSlot[];
    }[] = [];

    const [openHour] = timeSlots.openTime.split(":").map(Number);
    const [closeHour] = timeSlots.closeTime.split(":").map(Number);
    
    // 获取当前时间
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const isToday = date === today;
    
    // 最小提前预约时间（分钟）- 至少提前30分钟
    const minAdvanceMinutes = 30;
    
    // 按15分钟为步进生成时间段（匹配最小粒度）
    const stepMinutes = 15;
    
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += stepMinutes) {
        const startTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        
        // 计算结束时间
        const endMinutes = hour * 60 + minute + duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMinute = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
        
        // 检查是否超出营业时间
        if (endHour > closeHour || (endHour === closeHour && endMinute > 0)) {
          continue;
        }
        
        // 确定时段（上午/下午/晚上）
        let period: "morning" | "afternoon" | "evening";
        if (hour < 12) {
          period = "morning";
        } else if (hour < 18) {
          period = "afternoon";
        } else {
          period = "evening";
        }
        
        // 检查是否已过期（仅当天需要检查）
        let isPast = false;
        if (isToday) {
          const slotMinutes = hour * 60 + minute;
          const nowMinutes = currentHour * 60 + currentMinute + minAdvanceMinutes;
          isPast = slotMinutes < nowMinutes;
        }
        
        // 检查是否与已预约时段冲突
        const conflicts = bookedSlots.filter(slot => {
          // 时间段重叠检测
          return startTime < slot.endTime && endTime > slot.startTime;
        });
        
        ranges.push({
          startTime,
          endTime,
          period,
          available: !isPast && conflicts.length === 0,
          isPast,
          conflicts,
        });
      }
    }
    
    return ranges;
  }, [timeSlots, duration, bookedSlots, date]);

  // 按时段分组
  const groupedRanges = useMemo(() => {
    return {
      morning: timeRanges.filter(r => r.period === "morning"),
      afternoon: timeRanges.filter(r => r.period === "afternoon"),
      evening: timeRanges.filter(r => r.period === "evening"),
    };
  }, [timeRanges]);

  // 处理点击
  const handleClick = (range: typeof timeRanges[0]) => {
    if (range.available) {
      onTimeRangeChange(range.startTime);
    } else if (!range.isPast && range.conflicts.length > 0) {
      // 仅当有冲突（非过期）时显示冲突信息
      setConflictInfo({
        timeRange: `${range.startTime}-${range.endTime}`,
        conflicts: range.conflicts,
      });
    }
    // 已过期的时段点击无反应
  };

  // 时段标题
  const periodTitles = {
    morning: { label: "上午", icon: "☀️" },
    afternoon: { label: "下午", icon: "🌤️" },
    evening: { label: "晚上", icon: "🌙" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base">{texts.selectTimeText}</h3>
        <span className="text-sm text-muted-foreground">
          已选 {duration} 分钟
        </span>
      </div>

      {/* 时段分组 */}
      {(["morning", "afternoon", "evening"] as const).map((period) => {
        const ranges = groupedRanges[period];
        if (ranges.length === 0) return null;
        
        const { label, icon } = periodTitles[period];
        const availableCount = ranges.filter(r => r.available).length;
        
        return (
          <div key={period} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{icon}</span>
              <span>{label}</span>
              <span className="text-xs">
                ({availableCount}/{ranges.length} 可选)
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {ranges.map((range) => {
                const isSelected = selectedTimeRange === range.startTime;
                
                return (
                  <button
                    key={range.startTime}
                    onClick={() => handleClick(range)}
                    disabled={!range.available && false} // 允许点击查看冲突原因
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all text-left",
                      range.available
                        ? isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                        : "border-border bg-muted/50 opacity-60"
                    )}
                  >
                    {/* 时间段 */}
                    <div className={cn(
                      "font-medium",
                      isSelected ? "text-primary" : range.available ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {range.startTime}-{range.endTime}
                    </div>
                    
                    {/* 状态/价格 */}
                    <div className="text-sm mt-1">
                      {range.available ? (
                        <span className={isSelected ? "text-primary" : "text-muted-foreground"}>
                          ¥{price}
                        </span>
                      ) : range.isPast ? (
                        <span className="text-muted-foreground">
                          已过期
                        </span>
                      ) : (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {texts.statusBooked}
                        </span>
                      )}
                    </div>
                    
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
      })}

      {/* 冲突信息弹窗 */}
      {conflictInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-2xl p-5 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">此时段不可选</span>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {conflictInfo.timeRange} {texts.conflictTip}：
              </p>
              
              {conflictInfo.conflicts.map((slot, index) => (
                <div key={index} className="bg-muted/50 rounded-lg p-3 text-sm">
                  <div className="font-medium">{slot.startTime}-{slot.endTime}</div>
                  {slot.userName && (
                    <div className="text-muted-foreground">{slot.userName} 已预约</div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">💡 建议选择：</p>
              <div className="flex gap-2 flex-wrap">
                {timeRanges
                  .filter(r => r.available)
                  .slice(0, 3)
                  .map(r => (
                    <button
                      key={r.startTime}
                      onClick={() => {
                        onTimeRangeChange(r.startTime);
                        setConflictInfo(null);
                      }}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20"
                    >
                      {r.startTime}-{r.endTime}
                    </button>
                  ))
                }
              </div>
            </div>
            
            <button
              onClick={() => setConflictInfo(null)}
              className="w-full py-2 border rounded-lg text-sm"
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
