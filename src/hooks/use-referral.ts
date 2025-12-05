"use client";

import { useState, useEffect, useCallback } from "react";
import { get } from "@/lib/api";
import { referralConfig } from "@/config";

// ==================== 类型定义 ====================

interface InviteRecord {
  id: string;
  inviteeName: string;
  status: "pending" | "completed";
  points: number;
  createdAt: string;
}

interface ReferralInfo {
  inviteCode: string;
  inviteCount: number;
  totalPoints: number;
  records: InviteRecord[];
}

// ==================== 推荐信息 Hook ====================

/**
 * 推荐信息 Hook
 * 
 * 【职责】获取邀请码和邀请记录
 */
export function useReferralInfo() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReferralInfo | null>(null);

  const fetchInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await get<ReferralInfo>("/api/referral");
      setData(result);
    } catch (err) {
      console.error("获取推荐信息失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  return {
    loading,
    error,
    inviteCode: data?.inviteCode || "",
    inviteCount: data?.inviteCount || 0,
    totalPoints: data?.totalPoints || 0,
    records: data?.records || [],
    refresh: fetchInfo,
  };
}

// ==================== 配置 Hook ====================

/**
 * 推荐配置 Hook
 */
export function useReferralConfig() {
  return referralConfig;
}
