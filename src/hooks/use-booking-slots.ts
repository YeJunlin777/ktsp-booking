"use client";

/**
 * 预约时段 Hook
 * 
 * 【职责】管理时段选择状态，自动轮询刷新
 * 【配置化】轮询间隔等从配置读取
 */

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { bookingConfig } from "@/config";
import { 
  generateTimeSlots, 
  validateTimeSlot,
  type BookedSlot,
  type TimeValidationResult,
} from "@/lib/booking-time";

// ==================== 类型定义 ====================

interface UseBookingSlotsParams {
  resourceType: "venue" | "coach";
  resourceId: string;
  openTime: string;
  closeTime: string;
}

interface TimeSlotInfo {
  startTime: string;
  endTime: string;
  available: boolean;
  isPast: boolean;
  conflicts: BookedSlot[];
}

interface UseBookingSlotsReturn {
  // 状态
  loading: boolean;
  error: string | null;
  bookedSlots: BookedSlot[];
  
  // 选择
  selectedDate: string;
  selectedDuration: number;
  selectedTimeRange: string | null;
  
  // 计算属性
  timeSlots: TimeSlotInfo[];
  validation: TimeValidationResult | null;
  
  // 操作
  setSelectedDate: (date: string) => void;
  setSelectedDuration: (duration: number) => void;
  setSelectedTimeRange: (startTime: string | null) => void;
  refresh: () => Promise<void>;
}

// ==================== Hook 实现 ====================

export function useBookingSlots({
  resourceType,
  resourceId,
  openTime,
  closeTime,
}: UseBookingSlotsParams): UseBookingSlotsReturn {
  
  const { concurrency, timeBoundary } = bookingConfig;
  
  // ========== 状态 ==========
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  
  // 选择状态
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | null>(null);
  
  // ========== 数据获取 ==========
  
  const fetchBookedSlots = useCallback(async () => {
    if (!resourceId || !selectedDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = resourceType === "venue" 
        ? `/api/venues/${resourceId}/slots?date=${selectedDate}`
        : `/api/coaches/${resourceId}/slots?date=${selectedDate}`;
        
      const res = await fetch(endpoint);
      const data = await res.json();
      
      if (data.success && data.data?.bookedSlots) {
        setBookedSlots(data.data.bookedSlots);
      } else {
        setBookedSlots([]);
      }
    } catch (err) {
      console.error("获取时段失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, [resourceType, resourceId, selectedDate]);
  
  // 初始加载
  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);
  
  // 自动轮询
  useEffect(() => {
    const interval = setInterval(fetchBookedSlots, concurrency.pollInterval);
    return () => clearInterval(interval);
  }, [fetchBookedSlots, concurrency.pollInterval]);
  
  // ========== 计算属性 ==========
  
  // 生成时段列表
  const timeSlots = useMemo(() => {
    return generateTimeSlots(
      openTime,
      closeTime,
      selectedDuration,
      selectedDate,
      bookedSlots
    );
  }, [openTime, closeTime, selectedDuration, selectedDate, bookedSlots]);
  
  // 校验选中的时段
  const validation = useMemo(() => {
    if (!selectedTimeRange) return null;
    
    return validateTimeSlot(
      { date: selectedDate, startTime: selectedTimeRange, endTime: "" },
      selectedDuration,
      openTime,
      closeTime,
      bookedSlots
    );
  }, [selectedTimeRange, selectedDate, selectedDuration, openTime, closeTime, bookedSlots]);
  
  // ========== 操作 ==========
  
  // 切换日期时清空时间选择
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTimeRange(null);
  }, []);
  
  // 切换时长时清空时间选择
  const handleDurationChange = useCallback((duration: number) => {
    if (!timeBoundary.minDuration || !timeBoundary.maxDuration) return;
    
    // 校验时长范围
    if (duration < timeBoundary.minDuration || duration > timeBoundary.maxDuration) {
      return;
    }
    
    setSelectedDuration(duration);
    setSelectedTimeRange(null);
  }, [timeBoundary]);
  
  return {
    // 状态
    loading,
    error,
    bookedSlots,
    
    // 选择
    selectedDate,
    selectedDuration,
    selectedTimeRange,
    
    // 计算属性
    timeSlots,
    validation,
    
    // 操作
    setSelectedDate: handleDateChange,
    setSelectedDuration: handleDurationChange,
    setSelectedTimeRange,
    refresh: fetchBookedSlots,
  };
}

// ==================== 预约提交 Hook ====================

interface UseBookingSubmitReturn {
  submitting: boolean;
  error: string | null;
  conflicts: BookedSlot[];
  submit: (params: {
    type: "venue" | "coach";
    venueId?: string;
    coachId?: string;
    date: string;
    startTime: string;
    duration: number;
    totalPrice: number;
  }) => Promise<{ success: boolean; bookingId?: string }>;
  reset: () => void;
}

/**
 * 预约提交 Hook
 * 
 * 【防重复提交】
 * - submitting 状态锁
 * - 生成唯一请求ID防止重复
 */
export function useBookingSubmit(): UseBookingSubmitReturn {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<BookedSlot[]>([]);
  
  // 用于防止重复提交的请求ID
  const pendingRequestRef = useRef<string | null>(null);
  
  const submit = useCallback(async (params: {
    type: "venue" | "coach";
    venueId?: string;
    coachId?: string;
    date: string;
    startTime: string;
    duration: number;
    totalPrice: number;
  }) => {
    // 防止重复提交：如果正在提交，直接返回
    if (submitting || pendingRequestRef.current) {
      console.warn("请勿重复提交");
      return { success: false };
    }
    
    // 生成唯一请求ID
    const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    pendingRequestRef.current = requestId;
    
    setSubmitting(true);
    setError(null);
    setConflicts([]);
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          requestId, // 传给后端用于幂等性检测
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        return { success: true, bookingId: data.data?.id };
      } else {
        setError(data.error?.message || "预约失败");
        if (data.error?.conflicts) {
          setConflicts(data.error.conflicts);
        }
        return { success: false };
      }
    } catch (err) {
      console.error("提交预约失败:", err);
      setError("网络错误，请重试");
      return { success: false };
    } finally {
      setSubmitting(false);
      // 延迟清除请求ID，防止快速双击
      setTimeout(() => {
        if (pendingRequestRef.current === requestId) {
          pendingRequestRef.current = null;
        }
      }, 1000);
    }
  }, [submitting]);
  
  // 重置状态
  const reset = useCallback(() => {
    setError(null);
    setConflicts([]);
    pendingRequestRef.current = null;
  }, []);
  
  return { submitting, error, conflicts, submit, reset };
}
