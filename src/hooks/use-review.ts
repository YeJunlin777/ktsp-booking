"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { reviewConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface Review {
  id: string;
  userName: string;
  userAvatar?: string | null;
  venueRating?: number | null;
  coachRating?: number | null;
  venueComment?: string | null;
  coachComment?: string | null;
  createdAt: string;
}

interface SubmitReviewData {
  bookingId: string;
  venueId?: string;
  coachId?: string;
  venueRating?: number;
  coachRating?: number;
  venueComment?: string;
  coachComment?: string;
}

// ==================== 评价列表 Hook ====================

/**
 * 评价列表 Hook
 * 
 * 【职责】获取评价列表
 */
export function useReviewList(venueId?: string, coachId?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = "/api/reviews";
      const params = new URLSearchParams();
      if (venueId) params.set("venueId", venueId);
      if (coachId) params.set("coachId", coachId);
      if (params.toString()) url += `?${params.toString()}`;

      const data = await get<Review[]>(url);
      setReviews(data || []);
    } catch (err) {
      console.error("获取评价列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, [venueId, coachId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return { loading, error, reviews, refresh: fetchReviews };
}

// ==================== 提交评价 Hook ====================

/**
 * 提交评价 Hook
 * 
 * 【职责】处理评价提交
 */
export function useSubmitReview() {
  const [submitting, setSubmitting] = useState(false);

  const submitReview = useCallback(async (data: SubmitReviewData) => {
    try {
      setSubmitting(true);

      const result = await post<{ reviewId: string; message: string; points: number }>(
        "/api/reviews",
        data
      );
      
      toast.success(reviewConfig.texts.submitSuccess, {
        description: reviewConfig.texts.submitSuccessDesc,
      });

      return result;
    } catch (err) {
      console.error("提交评价失败:", err);
      toast.error("提交失败，请重试");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, []);

  return { submitting, submitReview };
}

// ==================== 配置 Hook ====================

/**
 * 评价配置 Hook
 */
export function useReviewConfig() {
  return reviewConfig;
}
