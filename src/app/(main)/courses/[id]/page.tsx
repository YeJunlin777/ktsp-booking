"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
  const { enrolling, enrollCourse } = useEnrollCourse();

  // 处理报名
  const handleEnroll = async () => {
    const result = await enrollCourse(id);
    if (result) {
      refresh();
      // 可选：跳转到预约列表
      // router.push("/bookings");
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="h-32 w-full" />
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
  const canEnroll = course.status === "enrolling" && remaining > 0;

  // 报名按钮文字
  const getButtonText = () => {
    if (enrolling) return "报名中...";
    if (course.status === "full" || remaining <= 0) return config.texts.fullButton;
    if (course.status !== "enrolling") return "暂不可报名";
    return config.texts.enrollButton;
  };

  return (
    <div className="min-h-screen pb-40 md:pb-24">
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

      {/* 报名要求 */}
      {course.requirements && (
        <div className="px-4 py-4 border-t">
          <h3 className="font-medium mb-2">报名要求</h3>
          <p className="text-sm text-muted-foreground">{course.requirements}</p>
        </div>
      )}

      {/* 底部报名栏 - 手机端需要在底部导航上方 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">课程费用</span>
            <span className="ml-2 text-xl font-bold text-primary">
              ¥{course.price}
            </span>
          </div>
          <Button
            disabled={!canEnroll || enrolling}
            onClick={handleEnroll}
          >
            {getButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}
