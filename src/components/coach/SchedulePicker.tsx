"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { coachConfig } from "@/config";

interface ScheduleSlot {
  id: string;
  time: string;
  endTime: string;
  available: boolean;
  unavailableReason?: string;  // 不可用原因
  duration: number;
  price: number;
}

interface SchedulePickerProps {
  slots: ScheduleSlot[];
  selectedSlot: string | null;
  onSlotSelect: (time: string | null) => void;
  className?: string;
}

/**
 * 教练排班时段选择组件
 * 
 * 【职责】展示和选择教练可用时段
 * 【配置化】文字从配置读取
 */
export function SchedulePicker({
  slots,
  selectedSlot,
  onSlotSelect,
  className,
}: SchedulePickerProps) {
  // 按上午/下午/晚上分组
  const groupedSlots = useMemo(() => {
    const morning: ScheduleSlot[] = [];
    const afternoon: ScheduleSlot[] = [];
    const evening: ScheduleSlot[] = [];

    slots.forEach((slot) => {
      const hour = parseInt(slot.time.split(":")[0], 10);
      if (hour < 12) {
        morning.push(slot);
      } else if (hour < 18) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return [
      { label: "上午", slots: morning },
      { label: "下午", slots: afternoon },
      { label: "晚上", slots: evening },
    ].filter((group) => group.slots.length > 0);
  }, [slots]);

  const handleSlotClick = (slot: ScheduleSlot) => {
    if (!slot.available) return;
    
    if (selectedSlot === slot.time) {
      onSlotSelect(null);
    } else {
      onSlotSelect(slot.time);
    }
  };

  if (slots.length === 0) {
    return (
      <div className={cn("py-8 text-center text-muted-foreground", className)}>
        当日暂无可预约时段
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <h3 className="font-medium">{coachConfig.texts.scheduleTitle}</h3>

      {groupedSlots.map((group) => (
        <div key={group.label} className="space-y-2">
          <div className="text-sm text-muted-foreground">{group.label}</div>
          <div className="grid grid-cols-3 gap-2">
            {group.slots.map((slot) => {
              const isSelected = selectedSlot === slot.time;
              const isDisabled = !slot.available;

              return (
                <button
                  key={slot.time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={isDisabled}
                  title={slot.unavailableReason}
                  className={cn(
                    "flex flex-col items-center py-2 px-1 rounded-lg border text-sm transition-all",
                    isSelected && "border-primary bg-primary/10 text-primary",
                    isDisabled && "bg-muted text-muted-foreground cursor-not-allowed opacity-50",
                    !isSelected && !isDisabled && "hover:border-primary/50"
                  )}
                >
                  <span className="font-medium">{slot.time}-{slot.endTime}</span>
                  <span className="text-xs">
                    {slot.available ? `¥${slot.price}` : (slot.unavailableReason || "不可约")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* 图例 */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-primary bg-primary/10" />
          <span>已选</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border" />
          <span>可选</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted opacity-50" />
          <span>不可约</span>
        </div>
      </div>
    </div>
  );
}
