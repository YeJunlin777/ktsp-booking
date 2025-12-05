import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { bookingConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
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

    // 查询预约
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    // 如果在免费取消时间内
    if (hoursUntilBooking < bookingConfig.rules.freeCancelHours) {
      // 计算违约金
      cancelFee = Math.round(refundAmount * 0.3); // 30% 违约金
      refundAmount = refundAmount - cancelFee;
    }

    // 更新预约状态
    await prisma.booking.update({
      where: { id },
      data: {
        status: "cancelled",
        cancelReason: reason || "用户取消",
      },
    });

    return success({
      message: bookingConfig.texts.cancelSuccess,
      refundAmount,
      cancelFee,
    });
  } catch (error) {
    console.error("取消预约失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
