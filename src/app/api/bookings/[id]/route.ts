import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 预约详情 API
 * 
 * GET /api/bookings/[id]
 */
export async function GET(
  _request: NextRequest,
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

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        venue: {
          select: { id: true, name: true, type: true, images: true },
        },
        coach: {
          select: { id: true, name: true, title: true, avatar: true },
        },
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("预约不存在");
    }

    // 验证是本人的预约
    if (booking.userId !== userId) {
      return Errors.FORBIDDEN();
    }

    // 格式化返回数据
    const formattedBooking = {
      id: booking.id,
      orderNo: booking.orderNo,
      type: booking.bookingType,
      status: booking.status,
      date: booking.bookingDate.toISOString().split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      originalPrice: Number(booking.originalPrice),
      discountPrice: booking.discountPrice ? Number(booking.discountPrice) : null,
      finalPrice: Number(booking.finalPrice),
      playerCount: booking.playerCount,
      cancelReason: booking.cancelReason,
      createdAt: booking.createdAt.toISOString(),
      venue: booking.venue ? {
        id: booking.venue.id,
        name: booking.venue.name,
        type: booking.venue.type,
        image: Array.isArray(booking.venue.images) && booking.venue.images.length > 0 
          ? booking.venue.images[0] as string 
          : null,
      } : null,
      coach: booking.coach ? {
        id: booking.coach.id,
        name: booking.coach.name,
        title: booking.coach.title,
        avatar: booking.coach.avatar,
      } : null,
    };

    return success(formattedBooking);
  } catch (error) {
    console.error("获取预约详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
