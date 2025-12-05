"use client";

import { cn } from "@/lib/utils";
import { CalendarX } from "lucide-react";
import { bookingConfig } from "@/config";

interface BookingEmptyProps {
  className?: string;
}

/**
 * 预约空状态组件
 * 
 * 【职责】展示无预约记录时的空状态
 * 【配置化】文案从配置读取
 */
export function BookingEmpty({ className }: BookingEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      <CalendarX className="w-16 h-16 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{bookingConfig.texts.emptyText}</p>
    </div>
  );
}
