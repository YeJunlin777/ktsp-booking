"use client";

import { cn } from "@/lib/utils";
import { venueConfig } from "@/config";

interface TimeSlot {
  time: string;       // 如 "09:00"
  available: boolean; // 是否可预约
  price: number;      // 该时段价格
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlots: string[];
  onSlotToggle: (time: string) => void;
  maxSelect?: number;
  className?: string;
}

/**
 * 时段选择组件
 * 
 * 【职责】展示和选择预约时段
 * 【配置化】文字从配置读取
 */
export function TimeSlotPicker({
  slots,
  selectedSlots,
  onSlotToggle,
  maxSelect = 4,
  className,
}: TimeSlotPickerProps) {
  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return;
    
    // 检查是否已选择
    const isSelected = selectedSlots.includes(slot.time);
    
    // 如果未选择且已达上限，不允许继续选择
    if (!isSelected && selectedSlots.length >= maxSelect) return;
    
    onSlotToggle(slot.time);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{venueConfig.texts.selectTimeText}</h3>
        <span className="text-xs text-muted-foreground">
          已选 {selectedSlots.length}/{maxSelect} 个时段
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedSlots.includes(slot.time);
          const isDisabled = !slot.available;
          const isMaxReached = !isSelected && selectedSlots.length >= maxSelect;

          return (
            <button
              key={slot.time}
              onClick={() => handleSlotClick(slot)}
              disabled={isDisabled || isMaxReached}
              className={cn(
                "flex flex-col items-center py-2 px-1 rounded-lg border text-sm transition-all",
                isSelected && "border-primary bg-primary/10 text-primary",
                isDisabled && "bg-muted text-muted-foreground cursor-not-allowed",
                !isSelected && !isDisabled && !isMaxReached && "hover:border-primary/50",
                isMaxReached && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              <span className="font-medium">{slot.time}</span>
              {slot.available ? (
                <span className="text-xs">¥{slot.price}</span>
              ) : (
                <span className="text-xs">{venueConfig.texts.statusBooked}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 图例 */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border border-primary bg-primary/10" />
          <span>已选</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded border" />
          <span>可选</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-muted" />
          <span>已约满</span>
        </div>
      </div>
    </div>
  );
}
