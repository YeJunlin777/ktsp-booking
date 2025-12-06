"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { FeedbackForm } from "@/components/feedback";
import { useFeedback } from "@/hooks/use-feedback";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";

/**
 * 意见反馈页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】表单UI拆分到独立组件
 * 【配置化】所有文案和规则从配置读取
 */
export default function FeedbackPage() {
  const { loading, submitting, config, submitFeedback } = useFeedback();

  // 加载中
  if (loading && !DEV_SKIP_AUTH) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background p-4 pb-24">
      <FeedbackForm
        types={config.types}
        contentPlaceholder={config.texts.contentPlaceholder}
        minLength={config.rules.contentMinLength}
        maxLength={config.rules.contentMaxLength}
        submitText={config.texts.submitButton}
        submittingText={config.texts.submitting}
        submitting={submitting}
        onSubmit={submitFeedback}
      />
    </div>
  );
}
