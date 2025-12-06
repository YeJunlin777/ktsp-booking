import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

/**
 * 获取用户统计数据 API
 * 
 * GET /api/user/stats
 */
export async function GET() {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    // 查询各项统计
    const [
      bookingCount,
      pendingBookingCount,
      pointsRecord,
      couponCount,
    ] = await Promise.all([
      // 预约总数
      prisma.booking.count({
        where: { userId },
      }),
      // 待完成预约
      prisma.booking.count({
        where: { userId, status: { in: ["pending", "confirmed"] } },
      }),
      // 用户积分
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true },
      }),
      // 可用优惠券
      prisma.userCoupon.count({
        where: { 
          userId, 
          status: "unused",
          expireAt: { gt: new Date() },
        },
      }),
    ]);

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && !pointsRecord) {
      return success({
        bookings: 5,
        pending: 2,
        points: 1500,
        coupons: 3,
      });
    }

    return success({
      bookings: bookingCount,
      pending: pendingBookingCount,
      points: pointsRecord?.points || 0,
      coupons: couponCount,
    });
  } catch (error) {
    console.error("获取用户统计失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
