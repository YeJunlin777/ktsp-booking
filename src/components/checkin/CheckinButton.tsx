"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 签到按钮组件 Props
 */
export interface CheckinButtonProps {
  /** 是否已签到 */
  isCheckedIn: boolean;
  /** 是否正在签到 */
  checking: boolean;
  /** 签到可获得的积分 */
  basePoints: number;
  /** 积分单位文字 */
  pointsUnit: string;
  /** 签到回调 */
  onCheckin: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * 签到按钮组件
 * 
 * 【职责】展示签到按钮，处理点击事件
 * 【复用】通过props控制所有状态和文字
 */
export function CheckinButton({
  isCheckedIn,
  checking,
  basePoints,
  pointsUnit,
  onCheckin,
  className,
}: CheckinButtonProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      {/* 签到按钮 */}
      <Button
        size="lg"
        className={cn(
          "w-32 h-32 rounded-full text-lg font-bold shadow-lg transition-all",
          isCheckedIn
            ? "bg-green-500 hover:bg-green-500 cursor-default"
            : "bg-primary hover:bg-primary/90 hover:scale-105"
        )}
        onClick={onCheckin}
        disabled={checking || isCheckedIn}
      >
        {checking ? (
          "签到中..."
        ) : isCheckedIn ? (
          <div className="flex flex-col items-center gap-1">
            <CheckCircle className="h-8 w-8" />
            <span className="text-sm">已签到</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <Gift className="h-8 w-8" />
            <span>签到</span>
          </div>
        )}
      </Button>

      {/* 积分提示 */}
      {!isCheckedIn && (
        <p className="text-sm text-muted-foreground">
          签到可得{" "}
          <span className="text-primary font-bold">+{basePoints}</span>{" "}
          {pointsUnit}
        </p>
      )}
    </div>
  );
}
