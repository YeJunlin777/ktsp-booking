import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { pointsConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 积分兑换商品 API
 * 
 * POST /api/products/[id]/redeem
 */
export async function POST(
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

    // 查询商品信息
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        points: true,
        stock: true,
        status: true,
      },
    });

    if (!product) {
      return Errors.NOT_FOUND("商品不存在");
    }

    if (product.status !== "active") {
      return Errors.INVALID_PARAMS("商品已下架");
    }

    if (product.stock <= 0) {
      return Errors.INVALID_PARAMS(pointsConfig.texts.soldOutText);
    }

    // 查询用户积分
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    // 开发模式：用户不存在时返回模拟成功
    if (!user && DEV_SKIP_AUTH) {
      return success({
        orderId: `mock_order_${Date.now()}`,
        message: pointsConfig.texts.redeemSuccess,
      });
    }

    // 用户积分
    const userPoints = user?.points ?? 0;

    if (userPoints < Number(product.points)) {
      return Errors.INVALID_PARAMS("积分不足");
    }

    // 生成订单号
    const orderNo = `PO${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // 获取用户当前积分余额
    const newBalance = userPoints - Number(product.points);

    // 使用事务处理兑换
    const result = await prisma.$transaction(async (tx) => {
      // 1. 扣减用户积分
      await tx.user.update({
        where: { id: userId as string },
        data: { points: { decrement: Number(product.points) } },
      });

      // 2. 扣减商品库存，增加销量
      await tx.product.update({
        where: { id },
        data: { 
          stock: { decrement: 1 },
          salesCount: { increment: 1 },
        },
      });

      // 3. 创建兑换订单
      const order = await tx.productOrder.create({
        data: {
          orderNo,
          userId: userId as string,
          productId: id,
          productName: product.name,
          points: Number(product.points),
          quantity: 1,
          status: "pending",
        },
      });

      // 4. 创建积分变动记录
      await tx.pointLog.create({
        data: {
          userId: userId as string,
          type: "redeem",
          points: -Number(product.points),
          balance: newBalance,
          remark: `兑换商品: ${product.name}`,
          relatedId: order.id,
        },
      });

      return order;
    });

    return success({
      orderId: result.id,
      message: pointsConfig.texts.redeemSuccess,
    });
  } catch (error) {
    console.error("兑换商品失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
