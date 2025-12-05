"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { bookingConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface BookingListItem {
  id: string;
  type: "venue" | "coach" | "course";
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  coachName?: string;
  totalPrice: number;
  createdAt: string;
}

interface BookingDetail extends BookingListItem {
  orderNo: string;
  originalPrice: number;
  discountPrice?: number | null;
  finalPrice: number;
  playerCount: number;
  cancelReason?: string | null;
  venue?: {
    id: string;
    name: string;
    type: string;
    image?: string | null;
  } | null;
  coach?: {
    id: string;
    name: string;
    title?: string | null;
    avatar?: string | null;
  } | null;
}

interface CreateBookingParams {
  type: "venue" | "coach";
  venueId?: string;
  coachId?: string;
  date: string;
  slots: string[];
  totalPrice: number;
}

// ==================== 预约列表 Hook ====================

/**
 * 预约列表 Hook
 * 
 * 【职责】获取和筛选预约列表
 */
export function useBookingList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  const fetchBookings = useCallback(async (status: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = status !== "all" 
        ? `/api/bookings?status=${status}` 
        : "/api/bookings";
      const data = await get<BookingListItem[]>(url);
      setBookings(data || []);
    } catch (err) {
      console.error("获取预约列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(activeTab);
  }, [fetchBookings, activeTab]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  return {
    loading,
    error,
    bookings,
    activeTab,
    onTabChange: handleTabChange,
    refresh: () => fetchBookings(activeTab),
  };
}

// ==================== 预约详情 Hook ====================

/**
 * 预约详情 Hook
 * 
 * 【职责】获取预约详情
 */
export function useBookingDetail(bookingId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await get<BookingDetail>(`/api/bookings/${bookingId}`);
      setBooking(data);
    } catch (err) {
      console.error("获取预约详情失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { loading, error, booking, refresh: fetchDetail };
}

// ==================== 创建预约 Hook ====================

/**
 * 创建预约 Hook
 * 
 * 【职责】处理预约创建流程
 */
export function useCreateBooking() {
  const [submitting, setSubmitting] = useState(false);

  const createBooking = useCallback(async (params: CreateBookingParams) => {
    try {
      setSubmitting(true);

      const result = await post<{ id: string; message: string }>("/api/bookings", params);
      
      toast.success(bookingConfig.texts.confirmSuccess, {
        description: bookingConfig.texts.confirmSuccessDesc,
      });

      return result;
    } catch (err) {
      console.error("创建预约失败:", err);
      toast.error("预约失败，请重试");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitting, createBooking };
}

// ==================== 取消预约 Hook ====================

/**
 * 取消预约 Hook
 * 
 * 【职责】处理预约取消流程
 */
export function useCancelBooking() {
  const [cancelling, setCancelling] = useState(false);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string) => {
    try {
      setCancelling(true);

      const result = await post<{ message: string; refundAmount: number; cancelFee: number }>(
        `/api/bookings/${bookingId}/cancel`,
        { reason }
      );
      
      toast.success(bookingConfig.texts.cancelSuccess);

      return result;
    } catch (err) {
      console.error("取消预约失败:", err);
      toast.error("取消失败，请重试");
      return null;
    } finally {
      setCancelling(false);
    }
  }, []);

  return { cancelling, cancelBooking };
}

// ==================== 配置 Hook ====================

/**
 * 预约配置 Hook
 */
export function useBookingConfig() {
  return bookingConfig;
}
