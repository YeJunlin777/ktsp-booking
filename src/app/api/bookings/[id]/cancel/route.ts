import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { bookingConfig, coachConfig } from "@/config";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 取消预约 API
 * 
 * POST /api/bookings/[id]/cancel
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const { id } = await params;
    const body = await request.json();
    const { reason } = body;

    // 查询预约（包含排班ID和乐观锁版本）
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        bookingType: true,
        bookingDate: true,
        startTime: true,
        finalPrice: true,
        coachId: true,     // 教练ID
        scheduleId: true,  // 教练排班ID
        version: true,     // 乐观锁版本
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("预约不存在");
    }

    // 验证是本人的预约
    if (booking.userId !== userId) {
      return Errors.FORBIDDEN();
    }

    // 检查状态是否可取消
    if (!["pending", "confirmed"].includes(booking.status)) {
      return Errors.INVALID_PARAMS("当前状态不可取消");
    }

    // 检查是否超过免费取消时间
    const bookingDateTime = new Date(booking.bookingDate);
    const [hours] = booking.startTime.split(":").map(Number);
    bookingDateTime.setHours(hours, 0, 0, 0);
    
    const now = new Date();
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    let refundAmount = Number(booking.finalPrice);
    let cancelFee = 0;

    // 获取免费取消时间（教练预约优先使用教练设置）
    let freeCancelHours = bookingConfig.rules.freeCancelHours;
    
    if (booking.bookingType === "coach" && booking.coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: booking.coachId },
        select: { freeCancelHours: true },
      });
      if (coach?.freeCancelHours != null) {
        freeCancelHours = coach.freeCancelHours;
      } else {
        // 使用教练模块的默认配置
        freeCancelHours = coachConfig.rules.freeCancelHours;
      }
    }

    // 如果在免费取消时间内（当前违约金比例为0，暂不收取）
    if (hoursUntilBooking < freeCancelHours && coachConfig.rules.cancelFeeRatio > 0) {
      cancelFee = Math.round(refundAmount * coachConfig.rules.cancelFeeRatio);
      refundAmount = refundAmount - cancelFee;
    }

    // 使用事务 + 乐观锁：更新预约状态 + 释放排班
    await prisma.$transaction(async (tx) => {
      // 1. 乐观锁更新预约状态（version 必须匹配）
      const updateResult = await tx.booking.updateMany({
        where: { 
          id, 
          version: booking.version,  // 乐观锁检查
          status: { in: ["pending", "confirmed"] },  // 双重检查状态
        },
        data: {
          status: "cancelled",
          cancelReason: reason || "用户取消",
          version: { increment: 1 },  // 递增版本
        },
      });

      // 如果更新失败，说明被其他操作抢先修改
      if (updateResult.count === 0) {
        throw new Error("CONCURRENT_MODIFICATION");
      }

      // 2. 教练预约：释放排班时段
      if (booking.bookingType === "coach" && booking.scheduleId) {
        await tx.coachSchedule.update({
          where: { id: booking.scheduleId },
          data: { isBooked: false },
        });
      }
    });

    return success({
      message: bookingConfig.texts.cancelSuccess,
      refundAmount,
      cancelFee,
    });
  } catch (error) {
    // 处理乐观锁冲突
    if (error instanceof Error && error.message === "CONCURRENT_MODIFICATION") {
      return Errors.INVALID_PARAMS("操作冲突，预约状态已变更，请刷新重试");
    }
    console.error("取消预约失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
