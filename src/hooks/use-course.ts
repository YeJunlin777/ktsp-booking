"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { courseConfig } from "@/config";
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
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  status: string;
}

interface CourseDetail extends Course {
  description?: string | null;
  coachId?: string | null;
  syllabus?: unknown;
  totalLessons: number;
  endTime: string;
  enrollDeadline?: string | null;
  schedule?: string | null;
  requirements?: string | null;
  location?: string | null;
}

// ==================== 课程列表 Hook ====================

/**
 * 课程列表 Hook
 * 
 * 【职责】获取和筛选课程列表
 */
export function useCourseList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchCourses = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = category !== "all" 
        ? `/api/courses?category=${category}` 
        : "/api/courses";
      const data = await get<Course[]>(url);
      setCourses(data || []);
    } catch (err) {
      console.error("获取课程列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses(selectedCategory);
  }, [fetchCourses, selectedCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    loading,
    error,
    courses,
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    refresh: () => fetchCourses(selectedCategory),
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
 * 【职责】处理课程报名
 */
export function useEnrollCourse() {
  const [enrolling, setEnrolling] = useState(false);

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
      toast.error("报名失败，请重试");
      return null;
    } finally {
      setEnrolling(false);
    }
  }, []);

  return { enrolling, enrollCourse };
}

// ==================== 配置 Hook ====================

/**
 * 课程配置 Hook
 */
export function useCourseConfig() {
  return courseConfig;
}
