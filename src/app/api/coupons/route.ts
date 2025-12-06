import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

/**
 * 用户优惠券列表 API
 * 
 * GET /api/coupons
 * Query: status - 状态筛选 (available/used/expired)
 */
export async function GET(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
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
      // 更新过期状态
      if (status === "available") {
        where.status = "unused";
        where.expireAt = { gt: new Date() };
      } else if (status === "expired") {
        where.OR = [
          { status: "expired" },
          { status: "unused", expireAt: { lte: new Date() } },
        ];
      } else {
        where.status = status;
      }
    }

    // 查询用户优惠券
    const coupons = await prisma.userCoupon.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        template: {
          select: {
            name: true,
            type: true,
            value: true,
            minAmount: true,
          },
        },
      },
    });

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && coupons.length === 0) {
      const mockCoupons = [
        {
          id: "1",
          name: "新人专享券",
          type: "amount",
          value: 20,
          minAmount: 100,
          status: "unused",
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          name: "周末8折券",
          type: "discount",
          value: 8,
          minAmount: 50,
          status: "unused",
          expireAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "3",
          name: "满减优惠券",
          type: "amount",
          value: 30,
          minAmount: 200,
          status: "used",
          expireAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      // 根据状态筛选
      let filtered = mockCoupons;
      if (status === "available") {
        filtered = mockCoupons.filter((c) => c.status === "unused");
      } else if (status === "used") {
        filtered = mockCoupons.filter((c) => c.status === "used");
      } else if (status === "expired") {
        filtered = mockCoupons.filter((c) => c.status === "expired" || new Date(c.expireAt) < new Date());
      }
      
      return success(filtered);
    }

    // 格式化返回数据
    const formattedCoupons = coupons.map((coupon) => ({
      id: coupon.id,
      name: coupon.template.name,
      type: coupon.template.type as "amount" | "discount",
      value: Number(coupon.template.value),
      minAmount: coupon.template.minAmount ? Number(coupon.template.minAmount) : null,
      status: coupon.status,
      expireAt: coupon.expireAt.toISOString(),
    }));

    return success(formattedCoupons);
  } catch (error) {
    console.error("获取优惠券列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
