"use client";

import { useState, useEffect, useCallback } from "react";
import { get, put } from "@/lib/api";
import { toast } from "sonner";
import { commonConfig } from "@/config";

// ==================== 类型定义 ====================

interface Booking {
  id: string;
  orderNo: string;
  type: string;
  status: string;
  userName: string;
  userPhone: string;
  targetName: string;
  targetType: string;
  date: string;
  startTime: string;
  endTime: string;
  originalPrice: number;
  finalPrice: number;
  createdAt: string;
}

interface BookingStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  no_show: number;
  cancelled: number;
}

interface UseAdminBookingListParams {
  keyword?: string;
  status?: string;
  type?: string;
}

// ==================== 预约列表 Hook ====================

/**
 * 管理后台 - 预约列表 Hook
 * 
 * 【职责】获取预约列表、统计数据、状态筛选
 */
export function useAdminBookingList() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<BookingStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    no_show: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UseAdminBookingListParams>({
    keyword: "",
    status: "all",
    type: "all",
  });

  // 获取统计数据（不受筛选条件影响）
  const fetchStats = useCallback(async () => {
    try {
      const data = await get<Booking[]>("/api/admin/bookings");
      const allBookings = data || [];
      setStats({
        total: allBookings.length,
        pending: allBookings.filter((b) => b.status === "pending").length,
        confirmed: allBookings.filter((b) => b.status === "confirmed").length,
        completed: allBookings.filter((b) => b.status === "completed").length,
        no_show: allBookings.filter((b) => b.status === "no_show").length,
        cancelled: allBookings.filter((b) => b.status === "cancelled").length,
      });
    } catch (error) {
      console.error("获取统计数据失败:", error);
    }
  }, []);

  // 获取列表数据（受筛选条件影响）
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.append("keyword", filters.keyword);
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.type && filters.type !== "all") params.append("type", filters.type);

      const url = `/api/admin/bookings${params.toString() ? `?${params}` : ""}`;
      const data = await get<Booking[]>(url);
      setBookings(data || []);
    } catch (error) {
      console.error("获取预约列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 初始加载
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 筛选条件变化时加载列表
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 更新筛选条件
  const setKeyword = useCallback((keyword: string) => {
    setFilters((prev) => ({ ...prev, keyword }));
  }, []);

  const setStatus = useCallback((status: string) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const setType = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  // 刷新数据
  const refresh = useCallback(() => {
    fetchBookings();
    fetchStats();
  }, [fetchBookings, fetchStats]);

  return {
    loading,
    bookings,
    stats,
    filters,
    setKeyword,
    setStatus,
    setType,
    refresh,
  };
}

// ==================== 预约操作 Hook ====================

/**
 * 管理后台 - 预约操作 Hook
 * 
 * 【职责】处理预约状态变更操作
 */
export function useAdminBookingAction(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async (
    bookingId: string,
    action: "confirm" | "complete" | "no_show" | "cancel",
    reason?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const result = await put<{ message: string; earnedPoints?: number; penaltyPoints?: number }>(
        `/api/admin/bookings/${bookingId}`,
        { action, reason }
      );

      toast.success(result?.message || "操作成功");

      if (result?.earnedPoints) {
        toast.info(`已发放 ${result.earnedPoints} 积分`);
      }
      if (result?.penaltyPoints) {
        toast.info(`已扣除 ${result.penaltyPoints} 积分`);
      }

      onSuccess?.();
      return true;
    } catch (error) {
      console.error("操作失败:", error);
      toast.error(commonConfig.errors.operationFailed);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  // 确认到店
  const confirmArrival = useCallback((bookingId: string) => {
    return handleAction(bookingId, "confirm");
  }, [handleAction]);

  // 完成订单（发放积分）
  const completeBooking = useCallback((bookingId: string) => {
    return handleAction(bookingId, "complete");
  }, [handleAction]);

  // 标记失约
  const markNoShow = useCallback((bookingId: string) => {
    return handleAction(bookingId, "no_show");
  }, [handleAction]);

  // 取消预约
  const cancelBooking = useCallback((bookingId: string, reason?: string) => {
    return handleAction(bookingId, "cancel", reason);
  }, [handleAction]);

  return {
    loading,
    confirmArrival,
    completeBooking,
    markNoShow,
    cancelBooking,
  };
}
