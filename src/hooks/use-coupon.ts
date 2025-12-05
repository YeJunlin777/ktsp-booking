"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { couponConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface Coupon {
  id: string;
  name: string;
  type: "amount" | "discount";
  value: number;
  minAmount?: number | null;
  status: string;
  expireAt: string;
}

interface CouponTemplate {
  id: string;
  name: string;
  type: "amount" | "discount";
  value: number;
  minAmount?: number | null;
  remaining?: number | null;
  claimed: boolean;
}

// ==================== 用户优惠券列表 Hook ====================

/**
 * 用户优惠券列表 Hook
 * 
 * 【职责】获取和筛选用户优惠券
 */
export function useCouponList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeType, setActiveType] = useState("all");

  const fetchCoupons = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = status !== "all" 
        ? `/api/coupons?status=${status}` 
        : "/api/coupons";
      const data = await get<Coupon[]>(url);
      setCoupons(data || []);
    } catch (err) {
      console.error("获取优惠券列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons(activeType);
  }, [fetchCoupons, activeType]);

  const handleTypeChange = useCallback((type: string) => {
    setActiveType(type);
  }, []);

  // 计算各状态数量
  const counts = {
    available: coupons.filter((c) => c.status === "unused").length,
    used: coupons.filter((c) => c.status === "used").length,
    expired: coupons.filter((c) => c.status === "expired").length,
  };

  return {
    loading,
    error,
    coupons,
    activeType,
    counts,
    onTypeChange: handleTypeChange,
    refresh: () => fetchCoupons(activeType),
  };
}

// ==================== 可领取优惠券 Hook ====================

/**
 * 可领取优惠券 Hook
 * 
 * 【职责】获取可领取的优惠券列表
 */
export function useAvailableCoupons() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<CouponTemplate[]>([]);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await get<CouponTemplate[]>("/api/coupons/available");
      setTemplates(data || []);
    } catch (err) {
      console.error("获取可领取优惠券失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return { loading, error, templates, refresh: fetchTemplates };
}

// ==================== 领取优惠券 Hook ====================

/**
 * 领取优惠券 Hook
 * 
 * 【职责】处理优惠券领取
 */
export function useClaimCoupon() {
  const [claiming, setClaiming] = useState(false);

  const claimCoupon = useCallback(async (templateId: string) => {
    try {
      setClaiming(true);

      const result = await post<{ couponId: string; message: string }>(
        "/api/coupons/claim",
        { templateId }
      );
      
      toast.success(couponConfig.texts.getSuccess);

      return result;
    } catch (err) {
      console.error("领取优惠券失败:", err);
      toast.error(couponConfig.texts.getFailed);
      return null;
    } finally {
      setClaiming(false);
    }
  }, []);

  return { claiming, claimCoupon };
}

// ==================== 配置 Hook ====================

/**
 * 优惠券配置 Hook
 */
export function useCouponConfig() {
  return couponConfig;
}
