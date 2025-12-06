"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { get, del } from "@/lib/api";
import { toast } from "sonner";
import { courseConfig } from "@/config";

const adminTexts = courseConfig.admin.texts;

// ==================== 类型定义 ====================

export interface AdminCourse {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  coachId?: string;
  coachName?: string;
  totalLessons: number;
  maxStudents: number;
  enrolled: number;
  price: number;
  startDate: string;
  endDate: string;
  enrollDeadline?: string;
  schedule?: string;
  requirements?: string;
  status: string;
  createdAt: string;
}

interface CourseFilters {
  keyword: string;
  status: string;
  category: string;
}

// ==================== Hook 实现 ====================

/**
 * 管理后台课程列表 Hook
 * 
 * 【职责】获取和管理课程列表数据
 * 【配置化】使用 courseConfig 配置
 */
export function useAdminCourseList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [filters, setFilters] = useState<CourseFilters>({
    keyword: "",
    status: "all",
    category: "all",
  });

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.keyword) params.set("keyword", filters.keyword);
      if (filters.status !== "all") params.set("status", filters.status);
      if (filters.category !== "all") params.set("category", filters.category);

      const result = await get<AdminCourse[]>(`/api/admin/courses?${params}`);
      setCourses(result || []);
    } catch (err) {
      console.error("获取课程列表失败:", err);
      setError(adminTexts.emptyText);
      toast.error(adminTexts.emptyText);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const updateFilters = useCallback((newFilters: Partial<CourseFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  return {
    loading,
    error,
    courses,
    filters,
    updateFilters,
    refresh: fetchCourses,
  };
}

/**
 * 管理后台课程操作 Hook
 * 
 * 【职责】处理课程的增删改操作
 */
export function useAdminCourseActions(onSuccess?: () => void) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const processingRef = useRef<Set<string>>(new Set());

  const deleteCourse = useCallback(async (course: AdminCourse) => {
    // 防抖
    if (processingRef.current.has(course.id)) {
      return false;
    }

    if (!confirm(`确定要删除课程「${course.name}」吗？`)) {
      return false;
    }

    try {
      processingRef.current.add(course.id);
      setDeleting(course.id);

      await del(`/api/admin/courses/${course.id}`);
      toast.success(courseConfig.admin.texts.deleteSuccess || "课程已删除");
      onSuccess?.();
      return true;
    } catch (err) {
      console.error("删除课程失败:", err);
      const message = err instanceof Error ? err.message : "删除失败，该课程可能有报名记录";
      toast.error(message);
      return false;
    } finally {
      processingRef.current.delete(course.id);
      setDeleting(null);
    }
  }, [onSuccess]);

  return {
    deleting,
    deleteCourse,
  };
}

/**
 * 管理后台课程弹窗 Hook
 * 
 * 【职责】管理新增/编辑弹窗状态
 */
export function useAdminCourseDialog() {
  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<AdminCourse | null>(null);

  const openAdd = useCallback(() => {
    setSelectedCourse(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((course: AdminCourse) => {
    setSelectedCourse(course);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    open,
    selectedCourse,
    setOpen,
    openAdd,
    openEdit,
    close,
  };
}

/**
 * 课程配置 Hook
 * 
 * 【职责】获取课程配置
 */
export function useAdminCourseConfig() {
  return courseConfig;
}
