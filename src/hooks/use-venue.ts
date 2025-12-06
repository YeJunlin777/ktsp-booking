"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { get } from "@/lib/api";
import { venueConfig, commonConfig } from "@/config";

// ==================== 类型定义 ====================

interface Venue {
  id: string;
  name: string;
  type: string;
  image?: string | null;
  price: number;
  peakPrice?: number | null;
  status: string;
  description?: string | null;
}

interface VenueDetail extends Venue {
  images: string[];
  facilities: string[];
  openTime: string;
  closeTime: string;
  capacity: number;
  minDuration: number;
  maxDuration: number;
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

// ==================== 场地列表 Hook ====================

/**
 * 场地列表 Hook
 * 
 * 【职责】获取和筛选场地列表
 */
export function useVenueList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchVenues = useCallback(async (type: string | null) => {
    try {
      setLoading(true);
      setError(null);

      const url = type ? `/api/venues?type=${type}` : "/api/venues";
      const data = await get<Venue[]>(url);
      setVenues(data || []);
    } catch (err) {
      console.error("获取场地列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues(selectedType);
  }, [fetchVenues, selectedType]);

  const handleTypeChange = useCallback((type: string | null) => {
    setSelectedType(type);
  }, []);

  return {
    loading,
    error,
    venues,
    selectedType,
    onTypeChange: handleTypeChange,
    refresh: () => fetchVenues(selectedType),
  };
}

// ==================== 场地详情 Hook ====================

/**
 * 场地详情 Hook
 * 
 * 【职责】获取场地详情
 */
export function useVenueDetail(venueId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [venue, setVenue] = useState<VenueDetail | null>(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);

        const data = await get<VenueDetail>(`/api/venues/${venueId}`);
        setVenue(data);
      } catch (err) {
        console.error("获取场地详情失败:", err);
        setError("加载失败，请刷新重试");
      } finally {
        setLoading(false);
      }
    }

    if (venueId) {
      fetchDetail();
    }
  }, [venueId]);

  return { loading, error, venue };
}

// ==================== 时段选择 Hook ====================

/**
 * 时段选择 Hook
 * 
 * 【职责】获取可用时段并管理选择
 */
export function useTimeSlots(venueId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    // 默认选择今天
    return new Date().toISOString().split("T")[0];
  });
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // 获取时段
  const fetchSlots = useCallback(async (date: string) => {
    if (!venueId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await get<TimeSlot[]>(`/api/venues/${venueId}/slots?date=${date}`);
      setSlots(data || []);
      setSelectedSlots([]); // 切换日期时清空选择
    } catch (err) {
      console.error("获取时段失败:", err);
      setError(commonConfig.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [venueId]);

  useEffect(() => {
    fetchSlots(selectedDate);
  }, [fetchSlots, selectedDate]);

  // 切换时段选择
  const handleSlotToggle = useCallback((time: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(time)) {
        return prev.filter((t) => t !== time);
      } else {
        return [...prev, time].sort();
      }
    });
  }, []);

  // 计算总价（使用useMemo避免重复计算）
  const totalPrice = useMemo(() => {
    return selectedSlots.reduce((sum, time) => {
      const slot = slots.find((s) => s.time === time);
      return sum + (slot?.price || 0);
    }, 0);
  }, [selectedSlots, slots]);

  return {
    loading,
    error,
    slots,
    selectedDate,
    selectedSlots,
    totalPrice,
    onDateChange: setSelectedDate,
    onSlotToggle: handleSlotToggle,
    clearSelection: () => setSelectedSlots([]),
  };
}

// ==================== 配置 Hook ====================

/**
 * 场地配置 Hook
 */
export function useVenueConfig() {
  return venueConfig;
}
