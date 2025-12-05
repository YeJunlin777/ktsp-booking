"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Gift } from "lucide-react";
import { pointsConfig } from "@/config";

interface PointsBalanceProps {
  points: number;
  className?: string;
}

/**
 * 积分余额卡片组件
 * 
 * 【职责】展示用户积分余额
 * 【配置化】文字从配置读取
 */
export function PointsBalance({ points, className }: PointsBalanceProps) {
  return (
    <Card className={cn("bg-gradient-to-r from-primary to-primary/70 text-primary-foreground", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm opacity-80">我的积分</p>
              <p className="text-3xl font-bold">{points.toLocaleString()}</p>
            </div>
          </div>
          <Link 
            href="/points/history"
            className="flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
          >
            {pointsConfig.texts.historyTitle}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
