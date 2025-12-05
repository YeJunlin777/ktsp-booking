import { useState, useCallback } from "react";
import { toast } from "sonner";
import { feedbackConfig } from "@/config/modules/feedback.config";

/**
 * 反馈项类型
 */
export interface FeedbackItem {
  id: string;
  type: string;
  content: string;
  images: string[];
  status: string;
  reply: string | null;
  createdAt: string;
}

/**
 * 反馈 Hook
 */
export function useFeedback() {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);

  const config = feedbackConfig;

  // 获取反馈列表
  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/feedback");
      const data = await res.json();
      if (data.success) {
        setFeedbacks(data.data);
      }
    } catch (error) {
      console.error("获取反馈列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 提交反馈
  const submitFeedback = useCallback(
    async (type: string, content: string, images: string[] = []) => {
      try {
        setSubmitting(true);
        const res = await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, content, images }),
        });
        const data = await res.json();

        if (data.success) {
          toast.success(config.texts.submitSuccess, {
            description: config.texts.submitSuccessDesc,
          });
          return true;
        } else {
          toast.error(data.error?.message || "提交失败");
          return false;
        }
      } catch (err) {
        console.error("提交反馈失败:", err);
        toast.error("提交失败，请重试");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [config.texts]
  );

  return {
    loading,
    submitting,
    feedbacks,
    config,
    fetchFeedbacks,
    submitFeedback,
  };
}
