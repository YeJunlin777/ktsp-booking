"use client";

import { cn } from "@/lib/utils";
import { Ticket } from "lucide-react";
import { couponConfig } from "@/config";

interface CouponEmptyProps {
  className?: string;
}

/**
 * 优惠券空状态组件
 * 
 * 【职责】展示无优惠券状态
 * 【配置化】文字从配置读取
 */
export function CouponEmpty({ className }: CouponEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Ticket className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{couponConfig.texts.emptyText}</p>
    </div>
  );
}
