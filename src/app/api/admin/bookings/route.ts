import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { bookingConfig } from "@/config";

/**
 * 管理后台 - 预约列表
 * 
 * GET /api/admin/bookings
 * 
 * Query:
 * - keyword: 搜索关键词（订单号/用户名/手机号）
 * - type: 预约类型（venue/coach/course）
 * - status: 状态筛选
 * - date: 日期筛选
 * - page: 页码
 * - pageSize: 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const type = searchParams.get("type") || "all";
    const status = searchParams.get("status") || "all";
    const date = searchParams.get("date") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || String(bookingConfig.admin.pageSize));

    // 构建查询条件
    const where: Record<string, unknown> = {};

    // 关键词搜索
    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword } },
        { user: { name: { contains: keyword } } },
        { user: { phone: { contains: keyword } } },
      ];
    }

    // 类型筛选
    if (type && type !== "all") {
      where.bookingType = type;
    }

    // 状态筛选
    if (status && status !== "all") {
      where.status = status;
    }

    // 日期筛选
    if (date) {
      const queryDate = new Date(date);
      where.bookingDate = queryDate;
    }

    // 查询总数
    const total = await prisma.booking.count({ where });

    // 查询列表
    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: { id: true, name: true, phone: true },
        },
        venue: {
          select: { id: true, name: true, type: true },
        },
        coach: {
          select: { id: true, name: true, title: true },
        },
        course: {
          select: { id: true, name: true },
        },
      },
    });

    // 格式化返回数据
    const formattedBookings = bookings.map((booking: typeof bookings[number]) => ({
      id: booking.id,
      orderNo: booking.orderNo,
      type: booking.bookingType,
      status: booking.status,
      // 用户信息
      userId: booking.user?.id,
      userName: booking.user?.name || "未知用户",
      userPhone: booking.user?.phone,
      // 预约目标
      targetName: booking.venue?.name || booking.coach?.name || booking.course?.name || "-",
      targetType: booking.venue?.type || booking.coach?.title || "-",
      // 时间信息
      date: booking.bookingDate.toISOString().split("T")[0],
      startTime: booking.startTime,
      endTime: booking.endTime,
      // 价格信息
      originalPrice: Number(booking.originalPrice),
      finalPrice: Number(booking.finalPrice),
      // 其他
      playerCount: booking.playerCount,
      cancelReason: booking.cancelReason,
      createdAt: booking.createdAt.toISOString(),
    }));

    return success(formattedBookings, {
      page,
      pageSize,
      total,
    });
  } catch (error) {
    console.error("获取预约列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
