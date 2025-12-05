"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useCheckin } from "@/hooks/use-checkin";
import { usePointsConfig } from "@/hooks/use-config";
import {
  CheckinButton,
  CheckinCalendar,
  PointsHeader,
  StreakBonusCard,
  EarnRulesCard,
} from "@/components/checkin";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;

/**
 * 签到页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有规则从配置读取
 */
export default function CheckinPage() {
  const { status } = useSession();
  const router = useRouter();
  const config = usePointsConfig();
  const { loading, checking, status: checkinStatus, doCheckin } = useCheckin();

  // 未登录跳转（开发模式跳过）
  useEffect(() => {
    if (!DEV_SKIP_AUTH && status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkin");
    }
  }, [status, router]);

  // 加载中（开发模式跳过session检查）
  if (loading || (!DEV_SKIP_AUTH && status === "loading")) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // 提取已签到日期
  const checkedDates = checkinStatus?.monthCheckins.map((c) => c.date) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 pb-24 space-y-4">
      {/* 积分统计 + 签到按钮 */}
      <PointsHeader
        totalPoints={checkinStatus?.totalPoints || 0}
        monthCount={checkinStatus?.monthCount || 0}
        streakDays={checkinStatus?.streakDays || 0}
      >
        <CheckinButton
          isCheckedIn={checkinStatus?.isCheckedIn || false}
          checking={checking}
          basePoints={config.checkin.basePoints}
          pointsUnit={config.texts.pointsUnit}
          onCheckin={doCheckin}
        />
      </PointsHeader>

      {/* 签到日历 */}
      {config.checkin.showCalendar && (
        <CheckinCalendar
          checkedDates={checkedDates}
          isTodayChecked={checkinStatus?.isCheckedIn}
        />
      )}

      {/* 连续签到奖励 */}
      <StreakBonusCard
        bonusList={config.checkin.streakBonus}
        currentStreak={checkinStatus?.streakDays || 0}
        pointsUnit={config.texts.pointsUnit}
      />

      {/* 积分获取方式 */}
      <EarnRulesCard rules={config.earnRules} />
    </div>
  );
}
