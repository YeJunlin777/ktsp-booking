import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { bookingConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
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
    const { type, venueId, coachId, date, slots, totalPrice } = body;

    // 验证参数
    if (!type || !date || !slots || slots.length === 0) {
      return Errors.INVALID_PARAMS("预约信息不完整");
    }

    if (type === "venue" && !venueId) {
      return Errors.INVALID_PARAMS("请选择场地");
    }

    if (type === "coach" && !coachId) {
      return Errors.INVALID_PARAMS("请选择教练");
    }

    // 检查用户当前有效预约数量
    const activeCount = await prisma.booking.count({
      where: {
        userId,
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (activeCount >= bookingConfig.rules.maxActiveBookings) {
      return Errors.INVALID_PARAMS(`最多同时预约${bookingConfig.rules.maxActiveBookings}个`);
    }

    // 计算时间
    const startTime = slots[0];
    const lastSlot = slots[slots.length - 1];
    const endHour = parseInt(lastSlot.split(":")[0], 10) + 1;
    const endTime = `${String(endHour).padStart(2, "0")}:00`;

    // 生成订单号
    const orderNo = `BK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 创建预约
    const booking = await prisma.booking.create({
      data: {
        orderNo,
        userId,
        bookingType: type,
        venueId: venueId || null,
        coachId: coachId || null,
        bookingDate: new Date(date),
        startTime,
        endTime,
        originalPrice: totalPrice,
        finalPrice: totalPrice,
        playerCount: 1,
        status: "pending",
      },
    });

    return success({
      id: booking.id,
      message: bookingConfig.texts.confirmSuccess,
    });
  } catch (error) {
    console.error("创建预约失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
