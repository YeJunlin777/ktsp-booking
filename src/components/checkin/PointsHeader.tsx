"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 积分头部卡片 Props
 */
export interface PointsHeaderProps {
  /** 当前积分 */
  totalPoints: number;
  /** 本月签到天数 */
  monthCount: number;
  /** 连续签到天数 */
  streakDays: number;
  /** 自定义类名 */
  className?: string;
  /** 子元素（通常是签到按钮） */
  children?: React.ReactNode;
}

/**
 * 积分统计头部卡片
 * 
 * 【职责】展示积分统计信息
 * 【复用】通过props传入数据
 */
export function PointsHeader({
  totalPoints,
  monthCount,
  streakDays,
  className,
  children,
}: PointsHeaderProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* 顶部统计区 */}
      <div className="bg-primary p-6 text-primary-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">当前积分</p>
            <p className="text-3xl font-bold">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">本月签到</p>
            <p className="text-2xl font-bold">{monthCount}天</p>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <CardContent className="p-6">
        <div className="flex flex-col items-center gap-4">
          {/* 连续签到提示 */}
          {streakDays > 0 && (
            <div className="flex items-center gap-2 text-orange-500">
              <Flame className="h-5 w-5" />
              <span className="font-medium">连续签到 {streakDays} 天</span>
            </div>
          )}

          {/* 子元素（签到按钮等） */}
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
