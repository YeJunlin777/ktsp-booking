"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface BookingSummaryProps {
  type: "venue" | "coach";
  // 预约对象信息
  targetName: string;
  targetType?: string;
  // 预约时间
  date: string;
  slots: string[];
  // 价格信息
  unitPrice: number;
  totalPrice: number;
  // 优惠信息
  discount?: number;
  couponDiscount?: number;
  pointsDiscount?: number;
  className?: string;
}

/**
 * 预约信息摘要组件
 * 
 * 【职责】展示预约确认信息
 */
export function BookingSummary({
  type,
  targetName,
  targetType,
  date,
  slots,
  unitPrice,
  totalPrice,
  discount = 0,
  couponDiscount = 0,
  pointsDiscount = 0,
  className,
}: BookingSummaryProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${month}月${day}日 ${weekdays[d.getDay()]}`;
  };

  // 计算时长
  const duration = type === "venue" ? slots.length : 1;
  const durationText = type === "venue" ? `${duration}小时` : "1课时";

  // 最终价格
  const finalPrice = totalPrice - discount - couponDiscount - pointsDiscount;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">预约信息</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 预约对象 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {type === "venue" ? "场地" : "教练"}
            </span>
            <span className="font-medium">{targetName}</span>
          </div>
          {targetType && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">类型</span>
              <span>{targetType}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* 预约时间 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">日期</span>
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">时段</span>
            <span>
              {type === "venue" 
                ? `${slots[0]} - ${parseInt(slots[slots.length - 1]) + 1}:00`
                : slots[0]
              }
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">时长</span>
            <span>{durationText}</span>
          </div>
        </div>

        <Separator />

        {/* 价格明细 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">单价</span>
            <span>¥{unitPrice}/{type === "venue" ? "小时" : "课时"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">小计</span>
            <span>¥{totalPrice}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>会员折扣</span>
              <span>-¥{discount}</span>
            </div>
          )}
          {couponDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>优惠券</span>
              <span>-¥{couponDiscount}</span>
            </div>
          )}
          {pointsDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>积分抵扣</span>
              <span>-¥{pointsDiscount}</span>
            </div>
          )}
        </div>

        <Separator />

        {/* 应付金额 */}
        <div className="flex justify-between items-center">
          <span className="font-medium">应付金额</span>
          <span className="text-xl font-bold text-primary">¥{finalPrice}</span>
        </div>
      </CardContent>
    </Card>
  );
}
