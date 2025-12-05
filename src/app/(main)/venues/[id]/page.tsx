"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useVenueDetail, useTimeSlots, useVenueConfig } from "@/hooks/use-venue";
import { VenueHeader, DatePicker, TimeSlotPicker } from "@/components/venue";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 场地详情页面
 * 
 * 【职责】展示场地详情和预约时段选择
 * 【组件化】所有UI拆分到独立组件
 */
export default function VenueDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useVenueConfig();
  
  const { loading: detailLoading, error: detailError, venue } = useVenueDetail(id);
  const {
    loading: slotsLoading,
    slots,
    selectedDate,
    selectedSlots,
    totalPrice,
    onDateChange,
    onSlotToggle,
  } = useTimeSlots(id);

  // 加载状态
  if (detailLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // 错误状态
  if (detailError || !venue) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          {detailError || "场地不存在"}
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    if (selectedSlots.length === 0) return;
    
    // TODO: 跳转到预约确认页面
    const query = new URLSearchParams({
      date: selectedDate,
      slots: selectedSlots.join(","),
    });
    router.push(`/bookings/create?venueId=${id}&${query}`);
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

      {/* 场地信息 */}
      <div className="px-4 py-4">
        <VenueHeader
          name={venue.name}
          type={venue.type}
          images={venue.images}
          price={venue.price}
          peakPrice={venue.peakPrice}
          description={venue.description}
          facilities={venue.facilities}
          openTime={venue.openTime}
          closeTime={venue.closeTime}
          capacity={venue.capacity}
        />
      </div>

      {/* 日期选择 */}
      <div className="px-4 py-4 border-t">
        <DatePicker
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </div>

      {/* 时段选择 */}
      <div className="px-4 py-4 border-t">
        {slotsLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : (
          <TimeSlotPicker
            slots={slots}
            selectedSlots={selectedSlots}
            onSlotToggle={onSlotToggle}
          />
        )}
      </div>

      {/* 底部预约栏 - 手机端需要在底部导航上方 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4">
        <div className="flex items-center justify-between">
          <div>
            {selectedSlots.length > 0 ? (
              <>
                <span className="text-sm text-muted-foreground">合计</span>
                <span className="ml-2 text-xl font-bold text-primary">
                  ¥{totalPrice}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                请选择预约时段
              </span>
            )}
          </div>
          <Button
            disabled={selectedSlots.length === 0}
            onClick={handleBooking}
          >
            {config.texts.confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
