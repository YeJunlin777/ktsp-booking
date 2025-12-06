import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { couponConfig } from "@/config";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

/**
 * 领取优惠券 API
 * 
 * POST /api/coupons/claim
 * Body: { templateId: string }
 */
export async function POST(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const body = await request.json();
    const { templateId } = body;

    if (!templateId) {
      return Errors.INVALID_PARAMS("缺少优惠券ID");
    }

    // 开发模式：直接返回成功
    if (DEV_SKIP_AUTH) {
      return success({
        couponId: `mock_coupon_${Date.now()}`,
        message: couponConfig.texts.getSuccess,
      });
    }

    // 查询优惠券模板
    const template = await prisma.couponTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return Errors.NOT_FOUND("优惠券不存在");
    }

    if (template.status !== "active") {
      return Errors.INVALID_PARAMS("优惠券已下架");
    }

    // 检查库存
    if (template.totalQuantity && template.claimedCount >= template.totalQuantity) {
      return Errors.INVALID_PARAMS("优惠券已被领完");
    }

    // 检查用户是否已领取
    const existingCoupon = await prisma.userCoupon.findFirst({
      where: { userId, templateId },
    });

    if (existingCoupon) {
      return Errors.INVALID_PARAMS("您已领取过此优惠券");
    }

    // 计算过期时间
    const expireAt = template.validDays 
      ? new Date(Date.now() + template.validDays * 24 * 60 * 60 * 1000)
      : template.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 生成券码
    const code = `CP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 使用事务领取
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建用户优惠券
      const coupon = await tx.userCoupon.create({
        data: {
          userId,
          templateId,
          code,
          status: "unused",
          expireAt,
        },
      });

      // 2. 更新模板已领取数量
      await tx.couponTemplate.update({
        where: { id: templateId },
        data: { claimedCount: { increment: 1 } },
      });

      return coupon;
    });

    return success({
      couponId: result.id,
      message: couponConfig.texts.getSuccess,
    });
  } catch (error) {
    console.error("领取优惠券失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
