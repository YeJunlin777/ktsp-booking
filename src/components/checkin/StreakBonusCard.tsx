"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * 连续签到奖励项
 */
export interface StreakBonusItem {
  days: number;
  points: number;
  label: string;
}

/**
 * 连续签到奖励卡片 Props
 */
export interface StreakBonusCardProps {
  /** 奖励规则列表 */
  bonusList: StreakBonusItem[];
  /** 当前连续签到天数 */
  currentStreak: number;
  /** 积分单位 */
  pointsUnit: string;
  /** 卡片标题 */
  title?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 连续签到奖励卡片
 * 
 * 【职责】展示连续签到奖励规则
 * 【复用】通过props传入奖励配置
 */
export function StreakBonusCard({
  bonusList,
  currentStreak,
  pointsUnit,
  title = "连续签到奖励",
  className,
}: StreakBonusCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {bonusList.map((bonus) => (
            <Badge
              key={bonus.days}
              variant={currentStreak >= bonus.days ? "default" : "outline"}
              className="px-3 py-1"
            >
              {bonus.label}: +{bonus.points}
              {pointsUnit}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
