"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ArrowLeft, Check } from "lucide-react";
import { CourseHeader } from "@/components/course";
import { useCourseDetail, useEnrollCourse, useCourseConfig } from "@/hooks/use-course";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 课程详情页面
 * 
 * 【职责】展示课程详情和报名
 * 【组件化】所有UI拆分到独立组件
 */
export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useCourseConfig();
  
  const { loading, error, course, refresh } = useCourseDetail(id);
  const { enrolling, cancelling, enrollCourse, cancelEnrollment } = useEnrollCourse();
  
  // 弹窗状态
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // 处理报名
  const handleEnroll = async () => {
    const result = await enrollCourse(id);
    if (result) {
      refresh();
    }
  };

  // 处理取消报名
  const handleCancelConfirm = async () => {
    const result = await cancelEnrollment(id);
    if (result) {
      setCancelDialogOpen(false);
      refresh();
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen">
        {/* 顶部栏 */}
        <div className="px-4 py-3 border-b">
          <Skeleton className="h-8 w-20" />
        </div>
        {/* 封面图 */}
        <Skeleton className="aspect-video w-full" />
        {/* 内容区 */}
        <div className="p-4 space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !course) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          {error || "课程不存在"}
        </div>
      </div>
    );
  }

  // 判断是否可报名
  const remaining = course.capacity - course.enrolled;
  const isEnrolled = !!course.userEnrollment;
  const isExpired = course.enrollDeadline && new Date(course.enrollDeadline) < new Date();
  const canEnroll = course.status === "enrolling" && remaining > 0 && !isEnrolled && !isExpired;

  // 报名按钮文字
  const getButtonText = () => {
    if (enrolling) return "报名中...";
    if (isEnrolled) return config.texts.enrolledButton;
    if (isExpired) return config.texts.expiredButton;
    if (course.status === "full" || remaining <= 0) return config.texts.fullButton;
    if (course.status !== "enrolling") return "暂不可报名";
    return config.texts.enrollButton;
  };

  return (
    <div className="min-h-screen pb-44 md:pb-28">
      {/* 返回按钮 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">{config.texts.detailTitle}</h1>
        </div>
      </div>

      {/* 课程信息 */}
      <div className="px-4 py-4">
        <CourseHeader
          name={course.name}
          image={course.image}
          description={course.description}
          category={course.category}
          level={course.level}
          coachName={course.coachName}
          startTime={course.startTime}
          duration={course.duration}
          capacity={course.capacity}
          enrolled={course.enrolled}
          price={course.price}
          location={course.location}
          status={course.status}
        />
      </div>

      {/* 已报名提示 */}
      {isEnrolled && (
        <div className="mx-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="w-5 h-5" />
            <span className="font-medium">{config.texts.enrolledTip}</span>
          </div>
          <p className="mt-1 text-sm text-green-600">
            报名时间：{new Date(course.userEnrollment!.enrolledAt).toLocaleString("zh-CN")}
          </p>
          <p className="mt-1 text-xs text-amber-600">
            {config.texts.cancelTip.replace("{hours}", String(config.rules.freeCancelHours))}
          </p>
        </div>
      )}

      {/* 上课时间 */}
      {course.schedule && (
        <div className="px-4 py-4 border-t">
          <h3 className="font-medium mb-2">上课时间</h3>
          <p className="text-sm text-muted-foreground">{course.schedule}</p>
        </div>
      )}

      {/* 课程大纲 */}
      {course.syllabus && course.syllabus.length > 0 && (
        <div className="px-4 py-4 border-t">
          <h3 className="font-medium mb-3">课程大纲</h3>
          <div className="space-y-3">
            {course.syllabus.map((item, index) => (
              <div key={index} className="text-sm">
                {item.title && (
                  <div className="font-medium text-foreground">{item.lesson ? `${item.lesson}. ` : ""}{item.title}</div>
                )}
                {item.content && (
                  <p className="text-muted-foreground mt-0.5">{item.content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 报名要求 */}
      {course.requirements && (
        <div className="px-4 py-4 border-t">
          <h3 className="font-medium mb-2">报名要求</h3>
          <p className="text-sm text-muted-foreground">{course.requirements}</p>
        </div>
      )}

      {/* 底部报名栏 - 手机端需要在底部导航上方，PC端贴底 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4 pb-safe md:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">课程费用</span>
            <span className="ml-2 text-xl font-bold text-primary">
              ¥{course.price}
            </span>
          </div>
          {isEnrolled ? (
            <Button
              variant="outline"
              disabled={cancelling}
              onClick={() => setCancelDialogOpen(true)}
            >
              {cancelling ? "取消中..." : "取消报名"}
            </Button>
          ) : (
            <Button
              disabled={!canEnroll || enrolling}
              onClick={handleEnroll}
            >
              {getButtonText()}
            </Button>
          )}
        </div>
      </div>

      {/* 取消报名确认弹窗 */}
      <ConfirmDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        title="取消报名"
        description={config.texts.cancelTip.replace("{hours}", String(config.rules.freeCancelHours))}
        confirmText="确认取消"
        cancelText="再想想"
        onConfirm={handleCancelConfirm}
        variant="destructive"
        loading={cancelling}
      />
    </div>
  );
}
