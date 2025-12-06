import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { bookingConfig } from "@/config";
import { BookingService } from "@/lib/booking-service";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

/**
 * 预约列表 API
 * 
 * GET /api/bookings
 * Query: status - 状态筛选
 */
export async function GET(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
    // 开发模式跳过登录
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // 构建查询条件
    const where: Record<string, unknown> = { userId };
    
    if (status && status !== "all") {
      if (status === "confirmed") {
        // 进行中包含 pending 和 confirmed
        where.status = { in: ["pending", "confirmed"] };
      } else {
        where.status = status;
      }
    }

    // 查询预约列表
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        venue: {
          select: { id: true, name: true, type: true },
        },
        coach: {
          select: { id: true, name: true, title: true },
        },
      },
      take: bookingConfig.list.pageSize,
    });

    // 格式化返回数据
    const formattedBookings = bookings.map((booking) => ({
      id: booking.id,
      type: booking.bookingType,
      status: booking.status,
      date: booking.bookingDate.toISOString().split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      venueName: booking.venue?.name,
      coachName: booking.coach?.name,
      totalPrice: Number(booking.finalPrice),
      createdAt: booking.createdAt.toISOString(),
    }));

    return success(formattedBookings);
  } catch (error) {
    console.error("获取预约列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 创建预约 API
 * 
 * POST /api/bookings
 * 
 * 【并发控制】通过 BookingService 处理所有并发场景
 */
export async function POST(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
    // 开发模式跳过登录
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const body = await request.json();
    const { type, venueId, coachId, scheduleId, date, startTime, duration, totalPrice, requestId } = body;

    // 基本参数校验
    if (!type || !date || !startTime || !duration) {
      return Errors.INVALID_PARAMS("预约信息不完整");
    }

    if (type === "venue" && !venueId) {
      return Errors.INVALID_PARAMS("请选择场地");
    }

    if (type === "coach" && !coachId) {
      return Errors.INVALID_PARAMS("请选择教练");
    }

    // 调用服务层创建预约（处理所有并发和校验逻辑）
    const result = await BookingService.createBooking({
      userId,
      type,
      venueId,
      coachId,
      scheduleId, // 教练排班ID
      date,
      startTime,
      duration: Number(duration),
      totalPrice: Number(totalPrice),
      requestId, // 用于幂等性检测
    });

    if (!result.success) {
      // 返回业务错误，带冲突详情
      return Errors.INVALID_PARAMS(result.error?.message || "预约失败", {
        code: result.error?.code,
        conflicts: result.error?.conflicts,
      });
    }

    return success({
      id: result.data?.id,
      orderNo: result.data?.orderNo,
      message: bookingConfig.texts.confirmSuccess,
    });
    
  } catch (error) {
    console.error("创建预约失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
