import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { bookingConfig } from "@/config";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 获取预约详情
 * 
 * GET /api/admin/bookings/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, phone: true } },
        venue: { select: { id: true, name: true, type: true } },
        coach: { select: { id: true, name: true, title: true } },
        course: { select: { id: true, name: true } },
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("预约不存在");
    }

    return success(booking);
  } catch (error) {
    console.error("获取预约详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 更新预约状态
 * 
 * PUT /api/admin/bookings/[id]
 * 
 * Body:
 * - action: "confirm" | "complete" | "no_show" | "cancel"
 * - reason?: string (取消原因)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, reason } = body;

    // 查询预约（包含乐观锁版本）
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        bookingType: true,
        coachId: true,      // 用于更新教练统计
        scheduleId: true,
        finalPrice: true,
        version: true,  // 乐观锁版本
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("预约不存在");
    }

    // 状态流转校验
    // pending: 确认到店/标记失约/取消
    // confirmed: 确认完成（用户不可取消）
    const validTransitions: Record<string, Record<string, string>> = {
      pending: { confirm: "confirmed", no_show: "no_show", cancel: "cancelled" },
      confirmed: { complete: "completed" },
    };

    const currentStatus = booking.status;
    const allowedActions = validTransitions[currentStatus];

    if (!allowedActions || !allowedActions[action]) {
      return Errors.INVALID_PARAMS(`当前状态 ${currentStatus} 不允许执行 ${action} 操作`);
    }

    const newStatus = allowedActions[action];

    // 使用事务 + 乐观锁处理
    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      // 1. 乐观锁更新预约状态
      const updateResult = await tx.booking.updateMany({
        where: { 
          id, 
          version: booking.version,  // 乐观锁检查
          status: currentStatus,      // 双重检查状态
        },
        data: {
          status: newStatus,
          cancelReason: action === "cancel" ? (reason || "管理员取消") : undefined,
          version: { increment: 1 },  // 递增版本
        },
      });

      // 如果更新失败，说明被其他操作抢先修改
      if (updateResult.count === 0) {
        throw new Error("CONCURRENT_MODIFICATION");
      }

      // 2. 完成订单：发放积分
      if (action === "complete") {
        const earnedPoints = Math.floor(Number(booking.finalPrice) * bookingConfig.points.earnRatio);
        
        if (earnedPoints > 0) {
          // 更新用户积分
          await tx.user.update({
            where: { id: booking.userId },
            data: { points: { increment: earnedPoints } },
          });

          // 记录积分流水
          await tx.pointLog.create({
            data: {
              userId: booking.userId,
              type: "booking",
              points: earnedPoints,
              balance: 0, // 会在查询时计算
              remark: bookingConfig.points.earnDescription,
              relatedId: booking.id,
            },
          });
        }

        // 教练预约：更新教练授课数
        if (booking.bookingType === "coach" && booking.coachId) {
          await tx.coach.update({
            where: { id: booking.coachId },
            data: { lessonCount: { increment: 1 } },
          });
        }

        return { message: "订单已完成", earnedPoints };
      }

      // 3. 取消订单：释放排班
      if (action === "cancel" && booking.bookingType === "coach" && booking.scheduleId) {
        await tx.coachSchedule.update({
          where: { id: booking.scheduleId },
          data: { isBooked: false },
        });
      }

      // 4. 失约处理：释放排班 + 扣分
      if (action === "no_show") {
        // 释放排班时段
        if (booking.bookingType === "coach" && booking.scheduleId) {
          await tx.coachSchedule.update({
            where: { id: booking.scheduleId },
            data: { isBooked: false },
          });
        }
        
        // 扣除积分
        const penaltyPoints = bookingConfig.rules.noShowPenaltyPoints;
        
        await tx.user.update({
          where: { id: booking.userId },
          data: { points: { decrement: penaltyPoints } },
        });

        await tx.pointLog.create({
          data: {
            userId: booking.userId,
            type: "booking",
            points: -penaltyPoints,
            balance: 0,
            remark: "预约失约扣除",
            relatedId: booking.id,
          },
        });

        return { message: "已标记失约", penaltyPoints };
      }

      return { message: `状态已更新为 ${newStatus}` };
    });

    return success(result);
  } catch (error) {
    // 处理乐观锁冲突
    if (error instanceof Error && error.message === "CONCURRENT_MODIFICATION") {
      return Errors.INVALID_PARAMS("操作冲突，预约状态已变更，请刷新页面重试");
    }
    console.error("更新预约状态失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
