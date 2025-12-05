"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import { bookingConfig } from "@/config";

interface BookingCardProps {
  id: string;
  type: "venue" | "coach" | "course";
  status: string;
  date: string;
  startTime: string;
  endTime: string;
  // 场地预约
  venueName?: string;
  // 教练预约
  coachName?: string;
  // 价格
  totalPrice: number;
  className?: string;
}

/**
 * 预约卡片组件
 * 
 * 【职责】展示单个预约记录
 * 【配置化】状态标签从配置读取
 */
export function BookingCard({
  id,
  type,
  status,
  date,
  startTime,
  endTime,
  venueName,
  coachName,
  totalPrice,
  className,
}: BookingCardProps) {
  const statusConfig = bookingConfig.status[status as keyof typeof bookingConfig.status];
  const typeLabel = type === "venue" 
    ? bookingConfig.texts.typeVenue 
    : type === "coach" 
      ? bookingConfig.texts.typeCoach 
      : bookingConfig.texts.typeCourse;

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${month}月${day}日 ${weekdays[d.getDay()]}`;
  };

  return (
    <Link href={`/bookings/${id}`}>
      <Card className={cn("hover:shadow-md transition-shadow", className)}>
        <CardContent className="p-4">
          {/* 头部：类型和状态 */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline">{typeLabel}</Badge>
            <Badge className={statusConfig?.color || ""}>
              {statusConfig?.label || status}
            </Badge>
          </div>

          {/* 预约内容 */}
          <div className="space-y-2">
            {/* 场地/教练名称 */}
            <div className="flex items-center gap-2 text-sm">
              {type === "venue" ? (
                <>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{venueName}</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{coachName}</span>
                </>
              )}
            </div>

            {/* 日期 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(date)}</span>
            </div>

            {/* 时间 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>

          {/* 底部：价格 */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">订单金额</span>
            <span className="text-lg font-semibold text-primary">¥{totalPrice}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
