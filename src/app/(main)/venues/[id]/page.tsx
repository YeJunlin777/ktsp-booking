"use client";

import { use, useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useVenueDetail, useVenueConfig } from "@/hooks/use-venue";
import { 
  VenueHeader, 
  BookingDatePicker, 
  DurationPicker, 
  TimeRangePicker,
  BookingConfirm,
  ImageGallery,
} from "@/components/venue";
import { venueConfig } from "@/config/modules/venue.config";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BookedSlot {
  startTime: string;
  endTime: string;
  userName?: string;
}

/**
 * 场地详情页面
 * 
 * 【职责】展示场地详情和预约时段选择
 * 【流程】日期选择 → 时长选择 → 时间段选择 → 确认预约
 */
export default function VenueDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useVenueConfig();
  
  const { loading: detailLoading, error: detailError, venue } = useVenueDetail(id);
  
  // 预约状态
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [selectedDuration, setSelectedDuration] = useState(60); // 默认1小时
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // 已占用时段（从API获取）
  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  // 获取已占用时段
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!id || !selectedDate) return;
      
      setSlotsLoading(true);
      try {
        const res = await fetch(`/api/venues/${id}/slots?date=${selectedDate}`);
        const data = await res.json();
        if (data.success && data.data?.bookedSlots) {
          setBookedSlots(data.data.bookedSlots);
        }
      } catch (error) {
        console.error("获取时段失败:", error);
      } finally {
        setSlotsLoading(false);
      }
    };
    
    fetchBookedSlots();
    
    // 每30秒刷新一次（实时更新）
    const interval = setInterval(fetchBookedSlots, 30000);
    return () => clearInterval(interval);
  }, [id, selectedDate]);

  // 计算价格
  const price = useMemo(() => {
    if (!venue) return 0;
    const option = venueConfig.durationOptions.find(o => o.minutes === selectedDuration);
    if (!option) return venue.price;
    return Math.round(venue.price * option.priceRatio - (option.discount || 0));
  }, [venue, selectedDuration]);

  // 计算结束时间
  const selectedEndTime = useMemo(() => {
    if (!selectedTimeRange) return null;
    const [hour, minute] = selectedTimeRange.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + selectedDuration;
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
  }, [selectedTimeRange, selectedDuration]);

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

  // 处理确认预约
  const handleConfirm = async () => {
    if (!selectedTimeRange) return;
    
    setSubmitting(true);
    try {
      // 跳转到预约创建页面，带上参数
      const query = new URLSearchParams({
        date: selectedDate,
        startTime: selectedTimeRange,
        duration: selectedDuration.toString(),
      });
      router.push(`/bookings/create?venueId=${id}&${query}`);
    } catch (error) {
      console.error("预约失败", error);
    } finally {
      setSubmitting(false);
    }
  };

  // 显示确认页面
  if (showConfirm && selectedTimeRange) {
    return (
      <div className="min-h-screen pb-40 md:pb-24">
        {/* 返回按钮 */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
          <Button variant="ghost" size="sm" onClick={() => setShowConfirm(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回修改
          </Button>
        </div>
        
        <div className="px-4 py-6">
          <BookingConfirm
            venueName={venue.name}
            date={selectedDate}
            startTime={selectedTimeRange}
            duration={selectedDuration}
            basePrice={venue.price}
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
            loading={submitting}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-40 md:pb-24">
      {/* 返回按钮 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">预约 {venue.name}</h1>
          <div className="w-16" /> {/* 占位 */}
        </div>
      </div>

      {/* 场地图片画廊 */}
      {venue.images && venue.images.length > 0 && (
        <ImageGallery
          images={venue.images}
          alt={venue.name}
          aspectRatio="16/9"
        />
      )}

      {/* 场地信息 */}
      <div className="px-4 py-4 bg-muted/30">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{venue.name}</h2>
            {venue.description && (
              <p className="text-sm text-muted-foreground mt-1">{venue.description}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xl text-primary font-bold">¥{venue.price}</p>
            <p className="text-xs text-muted-foreground">/小时</p>
          </div>
        </div>
      </div>

      {/* 日期选择 */}
      <div className="px-4 py-4 border-t">
        <BookingDatePicker
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            setSelectedTimeRange(null); // 切换日期时清空时间选择
          }}
        />
      </div>

      {/* 时长选择 */}
      <div className="px-4 py-4 border-t">
        <DurationPicker
          basePrice={venue.price}
          selectedDuration={selectedDuration}
          onDurationChange={(duration) => {
            setSelectedDuration(duration);
            setSelectedTimeRange(null); // 切换时长时清空时间选择
          }}
        />
      </div>

      {/* 时间段选择 */}
      <div className="px-4 py-4 border-t">
        <TimeRangePicker
          date={selectedDate}
          duration={selectedDuration}
          basePrice={venue.price}
          bookedSlots={bookedSlots}
          selectedTimeRange={selectedTimeRange}
          onTimeRangeChange={setSelectedTimeRange}
        />
      </div>

      {/* 底部预约栏 */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex-1">
            {selectedTimeRange ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{selectedDate}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{selectedTimeRange}-{selectedEndTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">合计</span>
                  <span className="text-xl font-bold text-primary">¥{price}</span>
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                {config.texts.selectTimeTip}
              </span>
            )}
          </div>
          <Button
            size="lg"
            disabled={!selectedTimeRange}
            onClick={() => setShowConfirm(true)}
          >
            {selectedTimeRange ? `确认预约 ¥${price}` : "请选择时间"}
          </Button>
        </div>
      </div>
    </div>
  );
}
