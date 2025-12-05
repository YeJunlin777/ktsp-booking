"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCoachDetail, useCoachSchedule, useCoachConfig } from "@/hooks/use-coach";
import { CoachHeader, CoachDatePicker, SchedulePicker } from "@/components/coach";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 教练详情页面
 * 
 * 【职责】展示教练详情和排班选择
 * 【组件化】所有UI拆分到独立组件
 */
export default function CoachDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useCoachConfig();
  
  const { loading: detailLoading, error: detailError, coach } = useCoachDetail(id);
  const {
    loading: scheduleLoading,
    slots,
    selectedDate,
    selectedSlot,
    selectedPrice,
    onDateChange,
    onSlotSelect,
  } = useCoachSchedule(id);

  // 加载状态
  if (detailLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // 错误状态
  if (detailError || !coach) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          {detailError || "教练不存在"}
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (!selectedSlot) return;
    
    // TODO: 跳转到预约确认页面
    const query = new URLSearchParams({
      date: selectedDate,
      time: selectedSlot,
    });
    router.push(`/bookings/create?coachId=${id}&${query}`);
  };

  return (
    <div className="min-h-screen pb-40 md:pb-24">
      {/* 返回按钮 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>

      {/* 教练信息 */}
      <div className="px-4 py-4">
        <CoachHeader
          name={coach.name}
          avatar={coach.avatar}
          title={coach.title}
          bio={coach.introduction}
          specialty={coach.specialty}
          experience={coach.experience}
          rating={coach.rating}
          reviewCount={coach.reviewCount}
          price={coach.price}
          certifications={coach.certifications}
        />
      </div>

      {/* 日期选择 */}
      <div className="px-4 py-4 border-t">
        <CoachDatePicker
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </div>

      {/* 时段选择 */}
      <div className="px-4 py-4 border-t">
        {scheduleLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <SchedulePicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotSelect={onSlotSelect}
          />
        )}
      </div>

      {/* 底部预约栏 - 手机端需要在底部导航上方 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            {selectedSlot ? (
              <>
                <span className="text-sm text-muted-foreground">课时费</span>
                <span className="ml-2 text-xl font-bold text-primary">
                  ¥{selectedPrice}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                请选择预约时段
              </span>
            )}
          </div>
          <Button
            disabled={!selectedSlot}
            onClick={handleBooking}
          >
            {config.texts.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
