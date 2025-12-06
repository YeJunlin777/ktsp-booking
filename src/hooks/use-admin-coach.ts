"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import { coachConfig } from "@/config";

const adminTexts = coachConfig.admin.texts;

// ==================== 类型定义 ====================

interface Coach {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  introduction?: string | null;
  specialty: string[];
  certifications?: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  lessonCount: number;
  price: number;
  minAdvanceHours?: number | null;
  freeCancelHours?: number | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

interface CoachFormData {
  name: string;
  avatar?: string | null;
  title?: string | null;
  introduction?: string | null;
  specialty: string[];
  certifications?: string[];
  experience: number;
  price: number;
  minAdvanceHours?: number | null;
  freeCancelHours?: number | null;
  status: string;
  sortOrder: number;
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface ScheduleData {
  coachId: string;
  coachName: string;
  startDate: string;
  endDate: string;
  schedules: Record<string, Schedule[]>;
}

// ==================== 教练列表 Hook ====================

/**
 * 管理后台 - 教练列表 Hook
 * 
 * 【职责】获取教练列表、搜索、删除
 */
export function useAdminCoachList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coaches, setCoaches] = useState<Coach[]>([]);

  const fetchCoaches = useCallback(async (keyword?: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (keyword) {
        params.set("keyword", keyword);
      }
      const result = await get<Coach[]>(`/api/admin/coaches?${params}`);
      setCoaches(result || []);
    } catch (err) {
      console.error("获取教练列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  const deleteCoach = useCallback(async (id: string, name: string): Promise<boolean> => {
    if (!confirm(`确定要删除教练「${name}」吗？`)) {
      return false;
    }

    try {
      await del(`/api/admin/coaches/${id}`);
      toast.success(adminTexts.deleteSuccess);
      fetchCoaches();
      return true;
    } catch (err) {
      console.error("删除教练失败:", err);
      toast.error(adminTexts.deleteFailed);
      return false;
    }
  }, [fetchCoaches]);

  return {
    loading,
    error,
    coaches,
    search: fetchCoaches,
    refresh: () => fetchCoaches(),
    deleteCoach,
  };
}

// ==================== 教练表单 Hook ====================

/**
 * 管理后台 - 教练表单 Hook
 * 
 * 【职责】创建、编辑教练
 */
export function useAdminCoachForm(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createCoach = useCallback(async (data: CoachFormData): Promise<boolean> => {
    try {
      setLoading(true);
      await post("/api/admin/coaches", data);
      toast.success(adminTexts.createSuccess);
      onSuccess?.();
      return true;
    } catch (err) {
      console.error("创建教练失败:", err);
      toast.error(adminTexts.setScheduleFailed);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  const updateCoach = useCallback(async (id: string, data: Partial<CoachFormData>): Promise<boolean> => {
    try {
      setLoading(true);
      await put(`/api/admin/coaches/${id}`, data);
      toast.success(adminTexts.updateSuccess);
      onSuccess?.();
      return true;
    } catch (err) {
      console.error("更新教练失败:", err);
      toast.error(adminTexts.setScheduleFailed);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    loading,
    createCoach,
    updateCoach,
  };
}

// ==================== 教练排班 Hook ====================

/**
 * 管理后台 - 教练排班 Hook
 * 
 * 【职责】获取、设置、删除排班
 */
export function useAdminCoachSchedule(coachId: string | null) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});

  const fetchSchedule = useCallback(async (startDate: string, endDate: string) => {
    if (!coachId) return;

    try {
      setLoading(true);
      const result = await get<ScheduleData>(
        `/api/admin/coaches/${coachId}/schedule?startDate=${startDate}&endDate=${endDate}`
      );
      setSchedules(result?.schedules || {});
    } catch (err) {
      console.error("获取排班失败:", err);
      toast.error(adminTexts.fetchScheduleFailed);
    } finally {
      setLoading(false);
    }
  }, [coachId]);

  const setDaySchedule = useCallback(async (
    date: string,
    slots: { startTime: string; endTime: string }[]
  ): Promise<boolean> => {
    if (!coachId) return false;

    try {
      setSaving(true);
      await put(`/api/admin/coaches/${coachId}/schedule`, { date, slots });
      toast.success(adminTexts.scheduleSetSuccess);
      return true;
    } catch (err) {
      console.error("设置排班失败:", err);
      toast.error(adminTexts.setScheduleFailed);
      return false;
    } finally {
      setSaving(false);
    }
  }, [coachId]);

  const setBatchSchedule = useCallback(async (
    scheduleData: { date: string; startTime: string; endTime: string }[]
  ): Promise<boolean> => {
    if (!coachId) return false;

    try {
      setSaving(true);
      await put(`/api/admin/coaches/${coachId}/schedule`, { schedules: scheduleData });
      toast.success(`已设置${scheduleData.length}个时段`);
      return true;
    } catch (err) {
      console.error("批量设置排班失败:", err);
      toast.error(adminTexts.setScheduleFailed);
      return false;
    } finally {
      setSaving(false);
    }
  }, [coachId]);

  const deleteSchedule = useCallback(async (scheduleId: string, isBooked: boolean): Promise<boolean> => {
    if (!coachId) return false;

    if (isBooked) {
      toast.error(adminTexts.bookedSlotError);
      return false;
    }

    try {
      setSaving(true);
      await del(`/api/admin/coaches/${coachId}/schedule?scheduleId=${scheduleId}`);
      toast.success(adminTexts.scheduleDeleteSuccess);
      return true;
    } catch (err) {
      console.error("删除时段失败:", err);
      toast.error(adminTexts.deleteFailed);
      return false;
    } finally {
      setSaving(false);
    }
  }, [coachId]);

  // 复制上周排班到本周
  const copyLastWeekSchedule = useCallback(async (): Promise<boolean> => {
    if (!coachId) return false;

    try {
      setSaving(true);
      const result = await post<{ copiedCount: number; message: string }>(
        `/api/admin/coaches/${coachId}/schedule/copy`,
        { copyLastWeek: true }
      );
      toast.success(result?.message || "复制成功");
      return true;
    } catch (err) {
      console.error("复制排班失败:", err);
      toast.error("复制失败，请确认上周有排班数据");
      return false;
    } finally {
      setSaving(false);
    }
  }, [coachId]);

  return {
    loading,
    saving,
    schedules,
    fetchSchedule,
    setDaySchedule,
    setBatchSchedule,
    deleteSchedule,
    copyLastWeekSchedule,
  };
}
