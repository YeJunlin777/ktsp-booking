"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { get } from "@/lib/api";
import { coachConfig } from "@/config";

// ==================== 类型定义 ====================

interface Coach {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  specialty: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  price: number;
  status: string;
}

interface CoachDetail extends Coach {
  introduction?: string | null;
  certifications: string[];
  lessonCount: number;
}

interface ScheduleSlot {
  time: string;
  available: boolean;
  duration: number;
  price: number;
}

// ==================== 教练列表 Hook ====================

/**
 * 教练列表 Hook
 * 
 * 【职责】获取和筛选教练列表
 */
export function useCoachList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchCoaches = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = category !== "all" 
        ? `/api/coaches?category=${category}` 
        : "/api/coaches";
      const data = await get<Coach[]>(url);
      setCoaches(data || []);
    } catch (err) {
      console.error("获取教练列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches(selectedCategory);
  }, [fetchCoaches, selectedCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    loading,
    error,
    coaches,
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    refresh: () => fetchCoaches(selectedCategory),
  };
}

// ==================== 教练详情 Hook ====================

/**
 * 教练详情 Hook
 * 
 * 【职责】获取教练详情
 */
export function useCoachDetail(coachId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coach, setCoach] = useState<CoachDetail | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await get<CoachDetail>(`/api/coaches/${coachId}`);
        setCoach(data);
      } catch (err) {
        console.error("获取教练详情失败:", err);
        setError("加载失败，请刷新重试");
      } finally {
        setLoading(false);
      }
    }

    if (coachId) {
      fetchDetail();
    }
  }, [coachId]);

  return { loading, error, coach };
}

// ==================== 教练排班 Hook ====================

/**
 * 教练排班 Hook
 * 
 * 【职责】获取教练排班并管理选择
 */
export function useCoachSchedule(coachId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // 获取排班
  const fetchSchedule = useCallback(async (date: string) => {
    if (!coachId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await get<ScheduleSlot[]>(`/api/coaches/${coachId}/schedule?date=${date}`);
      setSlots(data || []);
      setSelectedSlot(null); // 切换日期时清空选择
    } catch (err) {
      console.error("获取排班失败:", err);
      setError("加载排班失败");
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [fetchSchedule, selectedDate]);

  // 选择时段
  const handleSlotSelect = useCallback((time: string | null) => {
    setSelectedSlot(time);
  }, []);

  // 获取选中时段的价格
  const selectedPrice = useMemo(() => {
    if (!selectedSlot) return 0;
    const slot = slots.find((s) => s.time === selectedSlot);
    return slot?.price || 0;
  }, [selectedSlot, slots]);

  return {
    loading,
    error,
    slots,
    selectedDate,
    selectedSlot,
    selectedPrice,
    onDateChange: setSelectedDate,
    onSlotSelect: handleSlotSelect,
    clearSelection: () => setSelectedSlot(null),
  };
}

// ==================== 配置 Hook ====================

/**
 * 教练配置 Hook
 */
export function useCoachConfig() {
  return coachConfig;
}
