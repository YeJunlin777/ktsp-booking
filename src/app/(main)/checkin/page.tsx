"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Gift, Calendar, Flame } from "lucide-react";
import { toast } from "sonner";
import { usePointsConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";

/**
 * 签到页面
 * 
 * 【配置化】所有文字和规则从配置读取
 * 后续项目只需修改配置文件即可复用
 */

interface CheckinStatus {
  isCheckedIn: boolean;
  todayPoints: number;
  streakDays: number;
  totalPoints: number;
  monthCheckins: Array<{
    date: string;
    points: number;
    streakDays: number;
  }>;
  monthCount: number;
}

export default function CheckinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const config = usePointsConfig(); // 从配置读取
  
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState<CheckinStatus | null>(null);

  // 获取签到状态
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/checkin");
      const data = await res.json();
      if (data.success) {
        setCheckinStatus(data.data);
      }
    } catch (error) {
      console.error("获取签到状态失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 执行签到
  const handleCheckin = async () => {
    if (checking || checkinStatus?.isCheckedIn) return;
    
    setChecking(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        toast.success(config.texts.checkinSuccess, {
          description: `+${data.data.points} ${config.texts.pointsUnit}`,
        });
        // 刷新状态
        fetchStatus();
      } else {
        toast.error(data.error?.message || "签到失败");
      }
    } catch (error) {
      toast.error("签到失败，请重试");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkin");
      return;
    }
    if (status === "authenticated") {
      fetchStatus();
    }
  }, [status, router]);

  // 生成日历数据
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days = [];
    
    // 填充月初空白
    for (let i = 0; i < startWeekday; i++) {
      days.push({ day: 0, isChecked: false, isToday: false });
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isChecked = checkinStatus?.monthCheckins.some((c) => c.date === dateStr) || false;
      const isToday = day === today.getDate();
      days.push({ day, isChecked, isToday });
    }

    return days;
  };

  if (loading || status === "loading") {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background p-4 space-y-4">
      {/* 签到卡片 */}
      <Card className="overflow-hidden">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">当前积分</p>
              <p className="text-3xl font-bold">{checkinStatus?.totalPoints || 0}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">本月签到</p>
              <p className="text-2xl font-bold">{checkinStatus?.monthCount || 0}天</p>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4">
            {/* 连续签到 */}
            {checkinStatus?.streakDays ? (
              <div className="flex items-center gap-2 text-orange-500">
                <Flame className="h-5 w-5" />
                <span className="font-medium">连续签到 {checkinStatus.streakDays} 天</span>
              </div>
            ) : null}
            
            {/* 签到按钮 */}
            <Button
              size="lg"
              className={cn(
                "w-32 h-32 rounded-full text-lg font-bold shadow-lg transition-all",
                checkinStatus?.isCheckedIn
                  ? "bg-green-500 hover:bg-green-500 cursor-default"
                  : "bg-primary hover:bg-primary/90 hover:scale-105"
              )}
              onClick={handleCheckin}
              disabled={checking || checkinStatus?.isCheckedIn}
            >
              {checking ? (
                "签到中..."
              ) : checkinStatus?.isCheckedIn ? (
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
            
            {/* 今日可获得积分提示 */}
            {!checkinStatus?.isCheckedIn && (
              <p className="text-sm text-muted-foreground">
                签到可得 <span className="text-primary font-bold">+{config.checkin.basePoints}</span> {config.texts.pointsUnit}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 签到日历 */}
      {config.checkin.showCalendar && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {new Date().getMonth() + 1}月签到记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
                <div key={day} className="text-center text-xs text-muted-foreground py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    "aspect-square flex items-center justify-center rounded-md text-sm",
                    item.day === 0 && "invisible",
                    item.isToday && "ring-2 ring-primary",
                    item.isChecked && "bg-primary text-primary-foreground",
                    !item.isChecked && item.day > 0 && "bg-muted"
                  )}
                >
                  {item.day > 0 && (
                    item.isChecked ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      item.day
                    )
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 连续签到奖励规则 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">连续签到奖励</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {config.checkin.streakBonus.map((bonus) => (
              <Badge
                key={bonus.days}
                variant={
                  (checkinStatus?.streakDays || 0) >= bonus.days
                    ? "default"
                    : "outline"
                }
                className="px-3 py-1"
              >
                {bonus.label}: +{bonus.points}{config.texts.pointsUnit}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 积分获取规则 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">积分获取方式</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {config.earnRules.map((rule) => (
              <div key={rule.key} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm">{rule.label}</span>
                <span className="text-sm font-medium text-primary">{rule.points}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
