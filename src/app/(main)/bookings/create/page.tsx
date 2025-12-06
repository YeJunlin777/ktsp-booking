"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BookingSummary } from "@/components/booking";
import { useCreateBooking, useBookingConfig } from "@/hooks/use-booking";
import { useVenueDetail } from "@/hooks/use-venue";
import { useCoachDetail } from "@/hooks/use-coach";
import { venueConfig } from "@/config";

/**
 * 预约确认页面
 * 
 * 【职责】确认预约信息并提交
 * 【组件化】所有UI拆分到独立组件
 */
export default function CreateBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const config = useBookingConfig();
  
  // 从 URL 获取参数
  const venueId = searchParams.get("venueId");
  const coachId = searchParams.get("coachId");
  const date = searchParams.get("date") || "";
  
  // 场地预约参数
  const slotsParam = searchParams.get("slots") || "";
  const slots = slotsParam ? slotsParam.split(",") : [];
  
  // 教练预约参数
  const startTime = searchParams.get("startTime") || "";
  const endTime = searchParams.get("endTime") || "";
  const scheduleId = searchParams.get("scheduleId") || "";
  const duration = Number(searchParams.get("duration")) || 60;
  const price = Number(searchParams.get("price")) || 0;
  
  const type = venueId ? "venue" : "coach";

  // 获取场地/教练详情
  const { venue, loading: venueLoading } = useVenueDetail(venueId || "");
  const { coach, loading: coachLoading } = useCoachDetail(coachId || "");

  const { submitting, createBooking } = useCreateBooking();

  const loading = type === "venue" ? venueLoading : coachLoading;
  const target = type === "venue" ? venue : coach;

  // 计算价格
  const priceInfo = useMemo(() => {
    if (type === "coach") {
      // 教练预约：使用 URL 传递的价格
      return { unitPrice: price, totalPrice: price };
    }
    
    // 场地预约
    if (!target) return { unitPrice: 0, totalPrice: 0 };
    const unitPrice = Number(target.price);
    const totalPrice = unitPrice * slots.length;
    return { unitPrice, totalPrice };
  }, [target, type, slots.length, price]);

  // 提交预约
  const handleSubmit = async () => {
    const result = await createBooking({
      type,
      venueId: venueId || undefined,
      coachId: coachId || undefined,
      date,
      // 场地预约参数
      slots: type === "venue" ? slots : undefined,
      // 教练预约参数
      startTime: type === "coach" ? startTime : undefined,
      endTime: type === "coach" ? endTime : undefined,
      scheduleId: type === "coach" ? scheduleId : undefined,
      duration: type === "coach" ? duration : undefined,
      totalPrice: priceInfo.totalPrice,
    });

    if (result) {
      router.replace(`/bookings/${result.id}`);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // 参数校验
  const isValidParams = type === "venue" 
    ? (target && date && slots.length > 0)
    : (target && date && startTime && scheduleId);

  // 参数错误
  if (!isValidParams) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          预约信息不完整，请重新选择
        </div>
      </div>
    );
  }

  // 获取类型标签
  const targetType = type === "venue" 
    ? venueConfig.venueTypes.find(t => t.key === venue?.type)?.label
    : coach?.title;

  return (
    <div className="min-h-screen pb-40 md:pb-24">
      {/* 返回按钮 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">{config.texts.createTitle}</h1>
        </div>
      </div>

      {/* 预约信息 */}
      <div className="p-4">
        <BookingSummary
          type={type}
          targetName={target!.name}
          targetType={targetType || undefined}
          date={date}
          slots={type === "venue" ? slots : [`${startTime}-${endTime}`]}
          unitPrice={priceInfo.unitPrice}
          totalPrice={priceInfo.totalPrice}
        />
      </div>

      {/* 底部确认栏 - 手机端需要在底部导航上方 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">应付金额</span>
            <span className="ml-2 text-xl font-bold text-primary">
              ¥{priceInfo.totalPrice}
            </span>
          </div>
          <Button
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "提交中..." : config.texts.confirmButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
