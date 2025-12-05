"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Calendar, Clock, MapPin, User, Copy } from "lucide-react";
import { useBookingDetail, useCancelBooking, useBookingConfig } from "@/hooks/use-booking";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 预约详情页面
 * 
 * 【职责】展示预约详情和操作
 * 【组件化】所有UI拆分到独立组件
 */
export default function BookingDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useBookingConfig();
  
  const { loading, error, booking, refresh } = useBookingDetail(id);
  const { cancelling, cancelBooking } = useCancelBooking();
  
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${year}年${month}月${day}日 ${weekdays[d.getDay()]}`;
  };

  // 复制订单号
  const copyOrderNo = () => {
    if (booking?.orderNo) {
      navigator.clipboard.writeText(booking.orderNo);
      toast.success("已复制订单号");
    }
  };

  // 取消预约
  const handleCancel = async () => {
    const result = await cancelBooking(id);
    if (result) {
      setShowCancelDialog(false);
      refresh();
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
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

  const statusConfig = config.status[booking.status as keyof typeof config.status];
  const canCancel = ["pending", "confirmed"].includes(booking.status);
  const canReview = booking.status === "completed";

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

      <div className="p-4 space-y-4">
        {/* 状态卡片 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Badge className={statusConfig?.color || ""}>
                {statusConfig?.label || booking.status}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>订单号: {booking.orderNo}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyOrderNo}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 预约对象信息 */}
        <Card>
          <CardContent className="p-4">
            {booking.venue ? (
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {booking.venue.image ? (
                    <Image
                      src={booking.venue.image}
                      alt={booking.venue.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{booking.venue.name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.venue.type}</p>
                </div>
              </div>
            ) : booking.coach ? (
              <div className="flex gap-3">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                  {booking.coach.avatar ? (
                    <Image
                      src={booking.coach.avatar}
                      alt={booking.coach.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{booking.coach.name}</h3>
                  <p className="text-sm text-muted-foreground">{booking.coach.title}</p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* 预约时间 */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>{formatDate(booking.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{booking.startTime} - {booking.endTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* 价格信息 */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">原价</span>
              <span>¥{booking.originalPrice}</span>
            </div>
            {booking.discountPrice && (
              <div className="flex justify-between text-sm text-green-600">
                <span>优惠</span>
                <span>-¥{booking.originalPrice - booking.discountPrice}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-medium">
              <span>实付金额</span>
              <span className="text-primary">¥{booking.finalPrice}</span>
            </div>
          </CardContent>
        </Card>

        {/* 取消原因 */}
        {booking.cancelReason && (
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                取消原因：{booking.cancelReason}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 底部操作栏 - 手机端需要在底部导航上方 */}
      {(canCancel || canReview) && (
        <div className="fixed bottom-16 md:bottom-0 left-0 right-0 bg-background border-t p-4">
          {canCancel && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancelDialog(true)}
              disabled={cancelling}
            >
              {cancelling ? "取消中..." : config.texts.cancelButton}
            </Button>
          )}
          {canReview && (
            <Button
              className="w-full"
              onClick={() => router.push(`/bookings/${id}/review`)}
            >
              去评价
            </Button>
          )}
        </div>
      )}

      {/* 取消确认弹窗 */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config.texts.cancelConfirm}</AlertDialogTitle>
            <AlertDialogDescription>
              {config.texts.cancelWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>再想想</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>
              确定取消
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
