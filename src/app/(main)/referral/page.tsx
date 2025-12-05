"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { InviteCard, InviteList, ReferralRules } from "@/components/referral";
import { useReferralInfo, useReferralConfig } from "@/hooks/use-referral";

/**
 * 推荐有礼页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function ReferralPage() {
  const config = useReferralConfig();
  const { loading, error, inviteCode, inviteCount, totalPoints, records } = useReferralInfo();

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
      </div>

      {/* 内容 */}
      <div className="p-4 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-48 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : (
          <>
            {/* 邀请卡片 */}
            <InviteCard
              inviteCode={inviteCode}
              inviteCount={inviteCount}
              totalPoints={totalPoints}
            />

            {/* 活动规则 */}
            <ReferralRules />

            {/* 邀请记录 */}
            <InviteList records={records} />
          </>
        )}
      </div>
    </div>
  );
}
