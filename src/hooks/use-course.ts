"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { courseConfig, commonConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface Course {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  level: string;
  coachName: string;
  startTime: string;
  enrollDeadline?: string | null;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  status: string;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface UserEnrollment {
  bookingId: string;
  status: string;
  enrolledAt: string;
}

interface SyllabusItem {
  title?: string;
  lesson?: string;
  content?: string;
}

interface CourseDetail extends Course {
  description?: string | null;
  coachId?: string | null;
  syllabus?: SyllabusItem[] | null;
  totalLessons: number;
  endTime: string;
  enrollDeadline?: string | null;
  schedule?: string | null;
  requirements?: string | null;
  location?: string | null;
  userEnrollment?: UserEnrollment | null;
}

// ==================== 课程列表 Hook ====================

/**
 * 课程列表 Hook
 * 
 * 【职责】获取和筛选课程列表，支持分页
 */
export function useCourseList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchCourses = useCallback(async (category: string, pageNum: number) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      params.set("page", String(pageNum));
      params.set("pageSize", "10");

      const response = await fetch(`/api/courses?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setCourses(result.data || []);
        if (result.meta) {
          setPagination(result.meta);
        }
      } else {
        throw new Error(result.error?.message || commonConfig.errors.loadFailed);
      }
    } catch (err) {
      console.error("获取课程列表失败:", err);
      setError(commonConfig.errors.loadFailed);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(selectedCategory, page);
  }, [fetchCourses, selectedCategory, page]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    setPage(1); // 切换分类时重置页码
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    loading,
    error,
    courses,
    selectedCategory,
    page,
    pagination,
    onCategoryChange: handleCategoryChange,
    onPageChange: handlePageChange,
    refresh: () => fetchCourses(selectedCategory, page),
  };
}

// ==================== 课程详情 Hook ====================

/**
 * 课程详情 Hook
 * 
 * 【职责】获取课程详情
 */
export function useCourseDetail(courseId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await get<CourseDetail>(`/api/courses/${courseId}`);
      setCourse(data);
    } catch (err) {
      console.error("获取课程详情失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { loading, error, course, refresh: fetchDetail };
}

// ==================== 课程报名 Hook ====================

/**
 * 课程报名 Hook
 * 
 * 【职责】处理课程报名和取消报名
 */
export function useEnrollCourse() {
  const [enrolling, setEnrolling] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const enrollCourse = useCallback(async (courseId: string) => {
    try {
      setEnrolling(true);

      const result = await post<{ bookingId: string; message: string }>(
        `/api/courses/${courseId}/enroll`,
        {}
      );
      
      toast.success(courseConfig.texts.enrollSuccess, {
        description: courseConfig.texts.enrollSuccessDesc,
      });

      return result;
    } catch (err) {
      console.error("课程报名失败:", err);
      const message = err instanceof Error ? err.message : commonConfig.errors.operationFailed;
      toast.error(message);
      return null;
    } finally {
      setEnrolling(false);
    }
  }, []);

  const cancelEnrollment = useCallback(async (courseId: string) => {
    try {
      setCancelling(true);

      await post<{ message: string }>(
        `/api/courses/${courseId}/enroll/cancel`,
        {}
      );
      
      toast.success(courseConfig.texts.cancelSuccess);
      return true;
    } catch (err) {
      console.error("取消报名失败:", err);
      const message = err instanceof Error ? err.message : commonConfig.errors.operationFailed;
      toast.error(message);
      return false;
    } finally {
      setCancelling(false);
    }
  }, []);

  return { enrolling, cancelling, enrollCourse, cancelEnrollment };
}

// ==================== 配置 Hook ====================

/**
 * 课程配置 Hook
 */
export function useCourseConfig() {
  return courseConfig;
}
