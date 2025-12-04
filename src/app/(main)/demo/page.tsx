"use client";

import { usePointsConfig } from "@/hooks/use-config";
import { useCheckinDemo } from "@/hooks/use-checkin";
import {
  CheckinButton,
  CheckinCalendar,
  PointsHeader,
  StreakBonusCard,
  EarnRulesCard,
} from "@/components/checkin";

/**
 * 签到演示页面（无需登录）
 * 
 * 【职责】展示签到功能的UI效果
 * 【组件化】复用签到组件
 */
export default function DemoCheckinPage() {
  const config = usePointsConfig();
  const { checking, status, doCheckin } = useCheckinDemo();

  // 提取已签到日期
  const checkedDates = status?.monthCheckins.map((c) => c.date) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 space-y-4">
      {/* 演示标识 */}
      <div className="bg-yellow-100 text-yellow-800 text-center py-2 rounded-lg text-sm">
        🎭 演示模式 - 展示签到页面效果
      </div>

      {/* 积分统计 + 签到按钮 */}
      <PointsHeader
        totalPoints={status?.totalPoints || 0}
        monthCount={status?.monthCount || 0}
        streakDays={status?.streakDays || 0}
      >
        <CheckinButton
          isCheckedIn={status?.isCheckedIn || false}
          checking={checking}
          basePoints={config.checkin.basePoints}
          pointsUnit={config.texts.pointsUnit}
          onCheckin={doCheckin}
        />
      </PointsHeader>

      {/* 签到日历 */}
      <CheckinCalendar
        checkedDates={checkedDates}
        isTodayChecked={status?.isCheckedIn}
      />

      {/* 连续签到奖励 */}
      <StreakBonusCard
        bonusList={config.checkin.streakBonus}
        currentStreak={status?.streakDays || 0}
        pointsUnit={config.texts.pointsUnit}
      />

      {/* 积分获取方式 */}
      <EarnRulesCard rules={config.earnRules} />
    </div>
  );
}
