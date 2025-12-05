"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ReviewForm } from "@/components/review";
import { useBookingDetail } from "@/hooks/use-booking";
import { useSubmitReview, useReviewConfig } from "@/hooks/use-review";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 预约评价页面
 * 
 * 【职责】提交预约评价
 */
export default function BookingReviewPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useReviewConfig();
  
  const { loading, error, booking } = useBookingDetail(id);
  const { submitting, submitReview } = useSubmitReview();

  // 提交评价
  const handleSubmit = async (data: {
    venueRating?: number;
    coachRating?: number;
    venueComment?: string;
    coachComment?: string;
  }) => {
    const result = await submitReview({
      bookingId: id,
      venueId: booking?.venue?.id,
      coachId: booking?.coach?.id,
      ...data,
    });
    
    if (result) {
      // 返回预约详情
      router.push(`/bookings/${id}`);
      return true;
    }
    return false;
  };

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // 错误状态
  if (error || !booking) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          {error || "预约不存在"}
        </div>
      </div>
    );
  }

  // 检查是否可评价
  if (booking.status !== "completed") {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-muted-foreground">
          只能评价已完成的预约
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">{config.texts.pageTitle}</h1>
        </div>
      </div>

      {/* 预约信息 */}
      <div className="px-4 py-4 border-b bg-muted/30">
        <p className="font-medium">{booking.venueName || booking.coachName}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {booking.date} {booking.startTime}-{booking.endTime}
        </p>
      </div>

      {/* 评价表单 */}
      <div className="p-4">
        <ReviewForm
          showVenueRating={!!booking.venue}
          showCoachRating={!!booking.coach}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
