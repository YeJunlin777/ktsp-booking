/**
 * 优惠券服务层
 * 
 * 【职责】处理优惠券的并发使用问题
 * 【配置化】规则从配置文件读取
 * 
 * 数据库模型：
 * - CouponTemplate: 管理员创建的优惠券模板
 * - UserCoupon: 用户领取的优惠券
 * - Coupon: 旧优惠码（直接输入场景）
 */

import { prisma } from "@/lib/db";
import { couponConfig } from "@/config";

// ==================== 类型定义 ====================

export interface UseCouponParams {
  userId: string;
  couponId: string;     // UserCoupon 的 ID
  orderId?: string;     // 关联的订单ID
}

export interface CouponResult {
  success: boolean;
  data?: {
    couponId: string;
    discount: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

// ==================== 错误码 ====================

export const CouponErrorCode = {
  NOT_FOUND: "COUPON_NOT_FOUND",
  NOT_OWNED: "COUPON_NOT_OWNED",
  ALREADY_USED: "COUPON_ALREADY_USED",
  EXPIRED: "COUPON_EXPIRED",
  CONCURRENT_USE: "COUPON_CONCURRENT_USE",
} as const;

// ==================== 服务类 ====================

export class CouponService {
  
  /**
   * 使用用户优惠券（原子性操作）
   * 
   * 防止同一张券被并发使用
   */
  static async useUserCoupon(params: UseCouponParams): Promise<CouponResult> {
    const { userId, couponId, orderId } = params;
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询用户优惠券
        const userCoupon = await tx.userCoupon.findUnique({
          where: { id: couponId },
          include: {
            template: {
              select: { value: true, type: true },
            },
          },
        });
        
        if (!userCoupon) {
          throw { code: CouponErrorCode.NOT_FOUND, message: "优惠券不存在" };
        }
        
        // 2. 验证所有权
        if (userCoupon.userId !== userId) {
          throw { code: CouponErrorCode.NOT_OWNED, message: "该优惠券不属于您" };
        }
        
        // 3. 验证状态（核心：防止并发使用）
        if (userCoupon.status === "used" || userCoupon.usedAt) {
          throw { code: CouponErrorCode.ALREADY_USED, message: "优惠券已被使用" };
        }
        
        // 4. 验证有效期
        const now = new Date();
        if (userCoupon.expireAt && now > userCoupon.expireAt) {
          throw { code: CouponErrorCode.EXPIRED, message: "优惠券已过期" };
        }
        
        // 5. 原子性更新状态（乐观锁）
        const updated = await tx.userCoupon.updateMany({
          where: {
            id: couponId,
            status: "available",
            usedAt: null,
          },
          data: {
            status: "used",
            usedAt: now,
            usedOrderId: orderId,
          },
        });
        
        // 6. 检查更新结果（防止并发）
        if (updated.count === 0) {
          throw { 
            code: CouponErrorCode.CONCURRENT_USE, 
            message: "优惠券使用冲突，请刷新后重试" 
          };
        }
        
        return {
          couponId: userCoupon.id,
          discount: Number(userCoupon.template.value),
        };
        
      }, {
        isolationLevel: "Serializable",
        timeout: 5000,
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const bizError = error as { code: string; message: string };
        return {
          success: false,
          error: { code: bizError.code, message: bizError.message },
        };
      }
      
      console.error("使用优惠券失败:", error);
      throw error;
    }
  }
  
  /**
   * 回滚优惠券使用（订单取消时）
   */
  static async rollbackUserCoupon(couponId: string, orderId: string): Promise<boolean> {
    try {
      const result = await prisma.userCoupon.updateMany({
        where: {
          id: couponId,
          usedOrderId: orderId,
        },
        data: {
          status: "available",
          usedAt: null,
          usedOrderId: null,
        },
      });
      
      return result.count > 0;
    } catch (error) {
      console.error("回滚优惠券失败:", error);
      return false;
    }
  }
  
  /**
   * 领取优惠券（防止重复领取和库存超卖）
   */
  static async claimCoupon(userId: string, templateId: string): Promise<CouponResult> {
    const { rules } = couponConfig;
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 检查模板
        const template = await tx.couponTemplate.findUnique({
          where: { id: templateId },
        });
        
        if (!template || template.status !== "active") {
          throw { code: "TEMPLATE_INVALID", message: "优惠券活动不存在或已结束" };
        }
        
        // 2. 检查时间
        const now = new Date();
        if (template.startDate && now < template.startDate) {
          throw { code: "NOT_STARTED", message: "活动未开始" };
        }
        if (template.endDate && now > template.endDate) {
          throw { code: "ENDED", message: "活动已结束" };
        }
        
        // 3. 检查库存
        if (template.totalQuantity !== null && template.claimedCount >= template.totalQuantity) {
          throw { code: "OUT_OF_STOCK", message: "优惠券已领完" };
        }
        
        // 4. 检查用户领取数量
        const userClaimCount = await tx.userCoupon.count({
          where: { userId, templateId },
        });
        
        const limit = template.perUserLimit ?? rules.perUserLimit;
        if (userClaimCount >= limit) {
          throw { code: "LIMIT_EXCEEDED", message: `每人限领${limit}张` };
        }
        
        // 5. 原子性扣减库存
        if (template.totalQuantity !== null) {
          const updated = await tx.couponTemplate.updateMany({
            where: {
              id: templateId,
              claimedCount: { lt: template.totalQuantity },
            },
            data: {
              claimedCount: { increment: 1 },
            },
          });
          
          if (updated.count === 0) {
            throw { code: "OUT_OF_STOCK", message: "优惠券已领完" };
          }
        } else {
          // 无限量也要更新领取计数
          await tx.couponTemplate.update({
            where: { id: templateId },
            data: { claimedCount: { increment: 1 } },
          });
        }
        
        // 6. 生成券码
        const code = `CP${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        // 7. 计算过期时间
        const expireAt = new Date();
        expireAt.setDate(expireAt.getDate() + (template.validDays || 30));
        
        // 8. 创建用户优惠券
        const userCoupon = await tx.userCoupon.create({
          data: {
            userId,
            templateId,
            code,
            status: "available",
            expireAt,
          },
        });
        
        return {
          couponId: userCoupon.id,
          discount: Number(template.value),
        };
        
      }, {
        isolationLevel: "Serializable",
        timeout: 5000,
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const bizError = error as { code: string; message: string };
        return {
          success: false,
          error: { code: bizError.code, message: bizError.message },
        };
      }
      
      console.error("领取优惠券失败:", error);
      throw error;
    }
  }
  
  /**
   * 使用优惠码（旧模式，直接输入优惠码）
   */
  static async useCouponCode(code: string, amount: number): Promise<CouponResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询优惠码
        const coupon = await tx.coupon.findUnique({
          where: { code },
        });
        
        if (!coupon || coupon.status !== "active") {
          throw { code: "INVALID_CODE", message: "优惠码无效" };
        }
        
        // 2. 检查使用次数
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          throw { code: "EXHAUSTED", message: "优惠码已用完" };
        }
        
        // 3. 检查时间
        const now = new Date();
        if (coupon.startDate && now < coupon.startDate) {
          throw { code: "NOT_STARTED", message: "优惠码未生效" };
        }
        if (coupon.endDate && now > coupon.endDate) {
          throw { code: "EXPIRED", message: "优惠码已过期" };
        }
        
        // 4. 检查最低消费
        if (coupon.minAmount && amount < Number(coupon.minAmount)) {
          throw { code: "MIN_AMOUNT", message: `需满${coupon.minAmount}元可用` };
        }
        
        // 5. 原子性增加使用次数
        const updated = await tx.coupon.updateMany({
          where: {
            code,
            status: "active",
            OR: [
              { usageLimit: null },
              { usedCount: { lt: coupon.usageLimit ?? 0 } },
            ],
          },
          data: {
            usedCount: { increment: 1 },
          },
        });
        
        if (updated.count === 0) {
          throw { code: "CONCURRENT_USE", message: "优惠码使用冲突，请重试" };
        }
        
        // 6. 计算优惠金额
        let discount = 0;
        if (coupon.type === "fixed") {
          discount = Number(coupon.value);
        } else if (coupon.type === "percent") {
          discount = amount * Number(coupon.value) / 100;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, Number(coupon.maxDiscount));
          }
        }
        
        return {
          couponId: coupon.id,
          discount: Math.round(discount * 100) / 100,
        };
        
      }, {
        isolationLevel: "Serializable",
        timeout: 5000,
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const bizError = error as { code: string; message: string };
        return {
          success: false,
          error: { code: bizError.code, message: bizError.message },
        };
      }
      
      console.error("使用优惠码失败:", error);
      throw error;
    }
  }
}
