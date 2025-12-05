"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBookingList, useBookingConfig } from "@/hooks/use-booking";
import { BookingCard, BookingTabs, BookingEmpty } from "@/components/booking";

/**
 * 预约列表页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function BookingsPage() {
  const config = useBookingConfig();
  const { loading, error, bookings, activeTab, onTabChange } = useBookingList();

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
      </div>

      {/* 标签页 */}
      <BookingTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
      />

      {/* 预约列表 */}
      <div className="px-4 py-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : bookings.length === 0 ? (
          <BookingEmpty />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              id={booking.id}
              type={booking.type}
              status={booking.status}
              date={booking.date}
              startTime={booking.startTime}
              endTime={booking.endTime}
              venueName={booking.venueName}
              coachName={booking.coachName}
              totalPrice={booking.totalPrice}
            />
          ))
        )}
      </div>
    </div>
  );
}
