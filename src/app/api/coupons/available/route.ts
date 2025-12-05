import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 可领取优惠券列表 API
 * 
 * GET /api/coupons/available
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

    const now = new Date();

    // 查询可领取的优惠券模板
    const templates = await prisma.couponTemplate.findMany({
      where: {
        status: "active",
        isPublic: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } },
        ],
        AND: [
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && templates.length === 0) {
      const mockTemplates = [
        {
          id: "tpl_1",
          name: "新人专享20元券",
          type: "amount",
          value: 20,
          minAmount: 100,
          remaining: 50,
          claimed: false,
        },
        {
          id: "tpl_2",
          name: "周末8折优惠",
          type: "discount",
          value: 8,
          minAmount: 50,
          remaining: 100,
          claimed: false,
        },
        {
          id: "tpl_3",
          name: "满200减30",
          type: "amount",
          value: 30,
          minAmount: 200,
          remaining: 20,
          claimed: true,
        },
      ];
      
      return success(mockTemplates);
    }

    // 查询用户已领取的券
    const userClaimed = await prisma.userCoupon.findMany({
      where: { userId },
      select: { templateId: true },
    });
    const claimedIds = new Set(userClaimed.map((c) => c.templateId));

    // 格式化返回数据
    const formattedTemplates = templates.map((tpl) => ({
      id: tpl.id,
      name: tpl.name,
      type: tpl.type as "amount" | "discount",
      value: Number(tpl.value),
      minAmount: tpl.minAmount ? Number(tpl.minAmount) : null,
      remaining: tpl.totalQuantity ? tpl.totalQuantity - tpl.claimedCount : null,
      claimed: claimedIds.has(tpl.id),
    }));

    return success(formattedTemplates);
  } catch (error) {
    console.error("获取可领取优惠券失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
