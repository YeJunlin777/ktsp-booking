/**
 * 积分服务层
 * 
 * 【职责】处理积分发放/扣减的并发问题
 * 【配置化】积分规则从配置读取
 * 
 * 数据库模型：
 * - User.points: 用户积分余额
 * - PointLog: 积分流水记录
 */

import { prisma } from "@/lib/db";

// ==================== 类型定义 ====================

export interface PointsChangeParams {
  userId: string;
  points: number;       // 正数增加，负数减少
  type: "checkin" | "booking" | "redeem" | "invite" | "admin" | "refund";
  remark?: string;
  relatedId?: string;   // 关联的订单ID等
}

export interface PointsResult {
  success: boolean;
  data?: {
    points: number;     // 变动积分
    balance: number;    // 变动后余额
  };
  error?: {
    code: string;
    message: string;
  };
}

// ==================== 错误码 ====================

export const PointsErrorCode = {
  INSUFFICIENT: "POINTS_INSUFFICIENT",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  CONCURRENT_CONFLICT: "CONCURRENT_CONFLICT",
  ALREADY_REWARDED: "ALREADY_REWARDED",
} as const;

// ==================== 服务类 ====================

export class PointsService {
  
  /**
   * 变更积分（原子性操作）
   * 
   * 使用事务确保积分余额和流水记录一致
   */
  static async changePoints(params: PointsChangeParams): Promise<PointsResult> {
    const { userId, points, type, remark, relatedId } = params;
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询用户当前积分
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, points: true },
        });
        
        if (!user) {
          throw { code: PointsErrorCode.USER_NOT_FOUND, message: "用户不存在" };
        }
        
        // 2. 计算新余额
        const newBalance = user.points + points;
        
        // 3. 检查余额是否足够（扣减场景）
        if (newBalance < 0) {
          throw { 
            code: PointsErrorCode.INSUFFICIENT, 
            message: `积分不足，当前${user.points}，需要${Math.abs(points)}` 
          };
        }
        
        // 4. 原子性更新用户积分
        const updated = await tx.user.updateMany({
          where: {
            id: userId,
            points: user.points,  // 乐观锁：确保余额未变
          },
          data: {
            points: newBalance,
          },
        });
        
        if (updated.count === 0) {
          throw { 
            code: PointsErrorCode.CONCURRENT_CONFLICT, 
            message: "积分变更冲突，请重试" 
          };
        }
        
        // 5. 记录流水
        await tx.pointLog.create({
          data: {
            userId,
            type,
            points,
            balance: newBalance,
            remark,
            relatedId,
          },
        });
        
        return {
          points,
          balance: newBalance,
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
      
      console.error("变更积分失败:", error);
      throw error;
    }
  }
  
  /**
   * 预约完成发放积分
   * 
   * 防止重复发放
   */
  static async rewardBookingPoints(
    userId: string, 
    bookingId: string, 
    amount: number,
    pointsRatio: number = 1  // 每消费1元获得多少积分
  ): Promise<PointsResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 检查是否已发放过
        const existingLog = await tx.pointLog.findFirst({
          where: {
            userId,
            type: "booking",
            relatedId: bookingId,
          },
        });
        
        if (existingLog) {
          throw { 
            code: PointsErrorCode.ALREADY_REWARDED, 
            message: "该预约积分已发放" 
          };
        }
        
        // 2. 计算积分
        const points = Math.floor(amount * pointsRatio);
        if (points <= 0) {
          return { points: 0, balance: 0 };
        }
        
        // 3. 查询用户当前积分
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        
        if (!user) {
          throw { code: PointsErrorCode.USER_NOT_FOUND, message: "用户不存在" };
        }
        
        const newBalance = user.points + points;
        
        // 4. 更新积分
        await tx.user.update({
          where: { id: userId },
          data: { points: newBalance },
        });
        
        // 5. 记录流水
        await tx.pointLog.create({
          data: {
            userId,
            type: "booking",
            points,
            balance: newBalance,
            remark: `预约消费¥${amount}`,
            relatedId: bookingId,
          },
        });
        
        return { points, balance: newBalance };
        
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
      
      console.error("发放预约积分失败:", error);
      throw error;
    }
  }
  
  /**
   * 签到获取积分
   * 
   * 防止当日重复签到
   */
  static async checkinPoints(
    userId: string, 
    basePoints: number = 10
  ): Promise<PointsResult & { streakDays?: number }> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // 1. 检查今日是否已签到
        const todayCheckin = await tx.checkin.findFirst({
          where: {
            userId,
            checkinDate: {
              gte: today,
              lt: tomorrow,
            },
          },
        });
        
        if (todayCheckin) {
          throw { code: "ALREADY_CHECKED_IN", message: "今日已签到" };
        }
        
        // 2. 查询昨日签到（计算连续天数）
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const yesterdayCheckin = await tx.checkin.findFirst({
          where: {
            userId,
            checkinDate: {
              gte: yesterday,
              lt: today,
            },
          },
          select: { streakDays: true },
        });
        
        const streakDays = yesterdayCheckin ? yesterdayCheckin.streakDays + 1 : 1;
        
        // 3. 计算积分（连续签到加成）
        const bonusPoints = Math.min(streakDays - 1, 7) * 2;  // 每多签一天+2，最多+14
        const points = basePoints + bonusPoints;
        
        // 4. 查询用户积分
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        
        if (!user) {
          throw { code: PointsErrorCode.USER_NOT_FOUND, message: "用户不存在" };
        }
        
        const newBalance = user.points + points;
        
        // 5. 创建签到记录
        await tx.checkin.create({
          data: {
            userId,
            checkinDate: today,
            points,
            streakDays,
          },
        });
        
        // 6. 更新用户积分
        await tx.user.update({
          where: { id: userId },
          data: { points: newBalance },
        });
        
        // 7. 记录积分流水
        await tx.pointLog.create({
          data: {
            userId,
            type: "checkin",
            points,
            balance: newBalance,
            remark: `签到第${streakDays}天`,
          },
        });
        
        return { points, balance: newBalance, streakDays };
        
      }, {
        isolationLevel: "Serializable",
        timeout: 5000,
      });
      
      return { success: true, data: result, streakDays: result.streakDays };
      
    } catch (error) {
      if (error && typeof error === "object" && "code" in error) {
        const bizError = error as { code: string; message: string };
        return {
          success: false,
          error: { code: bizError.code, message: bizError.message },
        };
      }
      
      console.error("签到失败:", error);
      throw error;
    }
  }
  
  /**
   * 积分兑换商品
   * 
   * 防止库存超卖和积分不足
   */
  static async redeemProduct(
    userId: string,
    productId: string,
    quantity: number = 1
  ): Promise<PointsResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询商品
        const product = await tx.product.findUnique({
          where: { id: productId },
          select: { 
            id: true, 
            name: true, 
            points: true, 
            stock: true, 
            status: true,
          },
        });
        
        if (!product || product.status !== "active") {
          throw { code: "PRODUCT_INVALID", message: "商品不存在或已下架" };
        }
        
        // 2. 检查库存
        if (product.stock < quantity) {
          throw { code: "STOCK_NOT_ENOUGH", message: "库存不足" };
        }
        
        // 3. 计算所需积分
        const totalPoints = product.points * quantity;
        
        // 4. 查询用户积分
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        
        if (!user) {
          throw { code: PointsErrorCode.USER_NOT_FOUND, message: "用户不存在" };
        }
        
        if (user.points < totalPoints) {
          throw { 
            code: PointsErrorCode.INSUFFICIENT, 
            message: `积分不足，需要${totalPoints}，当前${user.points}` 
          };
        }
        
        const newBalance = user.points - totalPoints;
        
        // 5. 原子性扣减库存
        const stockUpdated = await tx.product.updateMany({
          where: {
            id: productId,
            stock: { gte: quantity },
          },
          data: {
            stock: { decrement: quantity },
          },
        });
        
        if (stockUpdated.count === 0) {
          throw { code: "STOCK_NOT_ENOUGH", message: "库存不足" };
        }
        
        // 6. 原子性扣减积分
        const pointsUpdated = await tx.user.updateMany({
          where: {
            id: userId,
            points: { gte: totalPoints },
          },
          data: {
            points: newBalance,
          },
        });
        
        if (pointsUpdated.count === 0) {
          throw { code: PointsErrorCode.INSUFFICIENT, message: "积分不足" };
        }
        
        // 7. 创建兑换订单
        const orderNo = `PO${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        await tx.productOrder.create({
          data: {
            orderNo,
            userId,
            productId,
            productName: product.name,
            points: totalPoints,
            quantity,
            status: "pending",
          },
        });
        
        // 8. 记录积分流水
        await tx.pointLog.create({
          data: {
            userId,
            type: "redeem",
            points: -totalPoints,
            balance: newBalance,
            remark: `兑换${product.name} x${quantity}`,
            relatedId: productId,
          },
        });
        
        return {
          points: -totalPoints,
          balance: newBalance,
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
      
      console.error("兑换商品失败:", error);
      throw error;
    }
  }
}
