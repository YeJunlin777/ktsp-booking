import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { pointsConfig, commonConfig } from "@/config";

/**
 * 签到状态类型
 */
export interface CheckinStatus {
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

/**
 * 签到结果类型
 */
export interface CheckinResult {
  points: number;
  streakDays: number;
  totalPoints: number;
  isStreakBonus: boolean;
}

/**
 * 签到 Hook
 * 
 * 【职责】处理签到相关的所有业务逻辑
 * - 获取签到状态
 * - 执行签到
 * - 状态管理
 */
export function useCheckin() {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const config = pointsConfig.checkin;
  const texts = pointsConfig.texts;

  // 获取签到状态
  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch("/api/checkin");
      const data = await res.json();
      
      if (data.success) {
        setStatus(data.data);
      } else {
        setError(data.error?.message || commonConfig.errors.loadFailed);
      }
    } catch (err) {
      setError(commonConfig.errors.networkError);
      console.error("获取签到状态失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 执行签到
  const doCheckin = useCallback(async (): Promise<CheckinResult | null> => {
    if (checking || status?.isCheckedIn) return null;

    try {
      setChecking(true);
      setError(null);

      const res = await fetch("/api/checkin", { method: "POST" });
      const data = await res.json();

      if (data.success) {
        const result = data.data as CheckinResult;
        
        // 更新本地状态
        setStatus((prev) => prev ? {
          ...prev,
          isCheckedIn: true,
          todayPoints: result.points,
          streakDays: result.streakDays,
          totalPoints: result.totalPoints,
          monthCount: prev.monthCount + 1,
        } : null);

        // 显示成功提示
        toast.success(texts.checkinSuccess, {
          description: `+${result.points} ${texts.pointsUnit}`,
        });

        return result;
      } else {
        const errorMsg = data.error?.message || "签到失败";
        setError(errorMsg);
        toast.error(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = "签到失败，请重试";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("签到失败:", err);
      return null;
    } finally {
      setChecking(false);
    }
  }, [checking, status?.isCheckedIn, texts]);

  // 初始化加载
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return {
    // 状态
    loading,
    checking,
    status,
    error,
    
    // 配置
    config,
    texts,
    
    // 方法
    doCheckin,
    refresh: fetchStatus,
  };
}

/**
 * 签到演示 Hook（无需API）
 * 
 * 【用途】用于演示页面，不调用真实API
 */
export function useCheckinDemo() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [streakDays, setStreakDays] = useState(5);
  const [totalPoints, setTotalPoints] = useState(1280);
  const [monthCount, setMonthCount] = useState(18);
  const [checking, setChecking] = useState(false);

  const config = pointsConfig.checkin;
  const texts = pointsConfig.texts;

  // 模拟签到
  const doCheckin = useCallback(async () => {
    if (checking || isCheckedIn) return null;

    setChecking(true);
    
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const earnedPoints = config.basePoints;
    
    setIsCheckedIn(true);
    setStreakDays((prev) => prev + 1);
    setTotalPoints((prev) => prev + earnedPoints);
    setMonthCount((prev) => prev + 1);

    toast.success(texts.checkinSuccess, {
      description: `+${earnedPoints} ${texts.pointsUnit}`,
    });

    setChecking(false);

    return {
      points: earnedPoints,
      streakDays: streakDays + 1,
      totalPoints: totalPoints + earnedPoints,
      isStreakBonus: false,
    };
  }, [checking, isCheckedIn, config.basePoints, texts, streakDays, totalPoints]);

  // 模拟已签到的日期
  const checkedDays = [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20, 21];

  return {
    loading: false,
    checking,
    status: {
      isCheckedIn,
      todayPoints: isCheckedIn ? config.basePoints : 0,
      streakDays,
      totalPoints,
      monthCheckins: checkedDays.map((day) => ({
        date: `2025-12-${String(day).padStart(2, "0")}`,
        points: config.basePoints,
        streakDays: day,
      })),
      monthCount,
    } as CheckinStatus,
    error: null,
    config,
    texts,
    doCheckin,
    refresh: () => {},
  };
}
