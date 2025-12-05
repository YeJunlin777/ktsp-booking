"use client";

import { useState, useEffect, useCallback } from "react";
import { get } from "@/lib/api";
import { memberConfig } from "@/config";

// ==================== 类型定义 ====================

interface LevelInfo {
  level: number;
  name: string;
  minPoints: number;
  discount: number;
  color: string;
  benefits: string[];
}

interface UserInfo {
  id: string;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  points: number;
  level: number;
  isVerified: boolean;
  levelInfo: LevelInfo;
}

interface UserStats {
  bookings: number;
  pending: number;
  points: number;
  coupons: number;
}

// ==================== 用户信息 Hook ====================

/**
 * 用户信息 Hook
 * 
 * 【职责】获取当前用户信息
 */
export function useUserInfo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await get<UserInfo>("/api/user");
      setUser(data);
    } catch (err) {
      console.error("获取用户信息失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { loading, error, user, refresh: fetchUser };
}

// ==================== 用户统计 Hook ====================

/**
 * 用户统计 Hook
 * 
 * 【职责】获取用户统计数据
 */
export function useUserStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await get<UserStats>("/api/user/stats");
      setStats(data);
    } catch (err) {
      console.error("获取用户统计失败:", err);
      setError("加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { loading, error, stats, refresh: fetchStats };
}

// ==================== 配置 Hook ====================

/**
 * 会员配置 Hook
 */
export function useMemberConfig() {
  return memberConfig;
}
