"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PointsBalance, PointsHistory } from "@/components/points";
import { usePointsHistory, usePointsConfig } from "@/hooks/use-points";
import { useUserInfo } from "@/hooks/use-member";

/**
 * 积分明细页面
 * 
 * 【职责】展示积分变动历史
 * 【组件化】所有UI拆分到独立组件
 */
export default function PointsHistoryPage() {
  const router = useRouter();
  const config = usePointsConfig();
  const { user } = useUserInfo();
  const { loading, error, records } = usePointsHistory();

  // 用户积分（开发模式使用模拟值）
  const userPoints = user?.points ?? 1500;

  return (
    <div className="min-h-screen pb-20">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">{config.texts.historyTitle}</h1>
        </div>
      </div>

      {/* 积分余额 */}
      <div className="px-4 pt-4">
        <PointsBalance points={userPoints} />
      </div>

      {/* 积分记录 */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : (
          <PointsHistory records={records} />
        )}
      </div>
    </div>
  );
}
