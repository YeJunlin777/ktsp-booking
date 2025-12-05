/**
 * 预约服务层
 * 
 * 【职责】封装预约核心业务逻辑，处理并发控制
 * 【使用】API 层调用此服务，不直接操作数据库
 */

import { prisma } from "@/lib/db";
import { bookingConfig } from "@/config";
import {
  calculateEndTime,
  isTimeRangeOverlap,
  isTimePast,
  isWithinBusinessHours,
  isDurationValid,
  isCrossDay,
  isDateInRange,
  type TimeRange,
  type BookedSlot,
} from "@/lib/booking-time";

// ==================== 类型定义 ====================

export interface CreateBookingParams {
  userId: string;
  type: "venue" | "coach" | "course";
  venueId?: string;
  coachId?: string;
  courseId?: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: number;
  requestId?: string; // 用于幂等性检测
}

export interface BookingResult {
  success: boolean;
  data?: {
    id: string;
    orderNo: string;
  };
  error?: {
    code: string;
    message: string;
    conflicts?: BookedSlot[];
  };
}

// ==================== 错误码定义 ====================

export const BookingErrorCode = {
  SLOT_CONFLICT: "SLOT_CONFLICT",
  SLOT_PAST: "SLOT_PAST",
  SLOT_TOO_SOON: "SLOT_TOO_SOON",
  SLOT_OUTSIDE_HOURS: "SLOT_OUTSIDE_HOURS",
  INVALID_DURATION: "INVALID_DURATION",
  CROSS_DAY: "CROSS_DAY",
  DATE_OUT_OF_RANGE: "DATE_OUT_OF_RANGE",
  MAX_BOOKINGS: "MAX_BOOKINGS",
  DUPLICATE_BOOKING: "DUPLICATE_BOOKING",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  CONCURRENT_CONFLICT: "CONCURRENT_CONFLICT",
} as const;

// ==================== 服务类 ====================

export class BookingService {
  
  /**
   * 创建预约
   * 
   * 使用事务 + 串行隔离级别确保并发安全
   */
  static async createBooking(params: CreateBookingParams): Promise<BookingResult> {
    const { userId, type, venueId, coachId, date, startTime, duration, totalPrice, requestId } = params;
    const { concurrency, timeBoundary, errors } = bookingConfig;
    const endTime = calculateEndTime(startTime, duration);
    
    // ========== 前置校验（无需数据库） ==========
    
    // 1. 时长校验
    if (!isDurationValid(duration)) {
      return {
        success: false,
        error: {
          code: BookingErrorCode.INVALID_DURATION,
          message: `时长必须在${timeBoundary.minDuration}-${timeBoundary.maxDuration}分钟之间`,
        },
      };
    }
    
    // 2. 日期范围校验
    if (!isDateInRange(date)) {
      return {
        success: false,
        error: {
          code: BookingErrorCode.DATE_OUT_OF_RANGE,
          message: `只能预约${timeBoundary.maxAdvanceDays}天内的时段`,
        },
      };
    }
    
    // 3. 跨天校验
    if (!timeBoundary.allowCrossDay && isCrossDay(startTime, endTime)) {
      return {
        success: false,
        error: {
          code: BookingErrorCode.CROSS_DAY,
          message: "暂不支持跨天预约",
        },
      };
    }
    
    // 4. 过期校验
    if (isTimePast(date, startTime)) {
      return {
        success: false,
        error: {
          code: BookingErrorCode.SLOT_TOO_SOON,
          message: errors.SLOT_TOO_SOON.replace("{minutes}", String(concurrency.minAdvanceMinutes)),
        },
      };
    }
    
    // ========== 事务处理（并发安全） ==========
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 5. 获取资源信息并校验营业时间
        let openTime = "06:00";
        let closeTime = "22:00";
        
        if (type === "venue" && venueId) {
          const venue = await tx.venue.findUnique({
            where: { id: venueId },
            select: { id: true, openTime: true, closeTime: true, status: true },
          });
          
          if (!venue) {
            throw { code: BookingErrorCode.RESOURCE_NOT_FOUND, message: "场地不存在" };
          }
          
          if (venue.status !== "active") {
            throw { code: BookingErrorCode.RESOURCE_NOT_FOUND, message: "场地暂不可用" };
          }
          
          openTime = venue.openTime;
          closeTime = venue.closeTime;
        }
        
        if (type === "coach" && coachId) {
          const coach = await tx.coach.findUnique({
            where: { id: coachId },
            select: { id: true, status: true },
          });
          
          if (!coach || coach.status !== "active") {
            throw { code: BookingErrorCode.RESOURCE_NOT_FOUND, message: "教练不存在或暂不可用" };
          }
        }
        
        // 6. 营业时间校验
        if (!isWithinBusinessHours(startTime, endTime, openTime, closeTime)) {
          throw { code: BookingErrorCode.SLOT_OUTSIDE_HOURS, message: errors.SLOT_OUTSIDE_HOURS };
        }
        
        // 7. 【幂等性】检查最近是否已创建相同预约（防重复提交）
        // 检查1分钟内同用户同资源同时段的预约
        const recentDuplicate = await tx.booking.findFirst({
          where: {
            userId,
            bookingDate: new Date(date),
            ...(type === "venue" ? { venueId } : { coachId }),
            startTime,
            endTime,
            createdAt: {
              gte: new Date(Date.now() - 60 * 1000), // 1分钟内
            },
          },
          select: { id: true, orderNo: true },
        });
        
        if (recentDuplicate) {
          // 幂等返回：返回已存在的预约ID
          return { id: recentDuplicate.id, orderNo: recentDuplicate.orderNo };
        }
        
        // 8. 用户预约数量限制
        const activeCount = await tx.booking.count({
          where: {
            userId,
            status: { in: concurrency.activeStatuses },
          },
        });
        
        if (activeCount >= bookingConfig.rules.maxActiveBookings) {
          throw {
            code: BookingErrorCode.MAX_BOOKINGS,
            message: errors.MAX_BOOKINGS.replace("{count}", String(bookingConfig.rules.maxActiveBookings)),
          };
        }
        
        // 9. 重复预约检测（同一用户、同一资源、同一时段 - 非近期）
        if (!concurrency.allowDuplicateBooking) {
          const duplicateBooking = await tx.booking.findFirst({
            where: {
              userId,
              bookingDate: new Date(date),
              status: { in: concurrency.activeStatuses },
              ...(type === "venue" ? { venueId } : { coachId }),
              startTime,
              endTime,
            },
          });
          
          if (duplicateBooking) {
            throw { code: BookingErrorCode.DUPLICATE_BOOKING, message: errors.DUPLICATE_BOOKING };
          }
        }
        
        // 10. 【核心】时段冲突检测
        const conflictingBookings = await tx.booking.findMany({
          where: {
            bookingDate: new Date(date),
            status: { in: concurrency.activeStatuses },
            ...(type === "venue" ? { venueId } : { coachId }),
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            user: { select: { name: true } },
          },
        });
        
        const newRange: TimeRange = { startTime, endTime };
        const conflicts = conflictingBookings.filter(booking => 
          isTimeRangeOverlap(newRange, { startTime: booking.startTime, endTime: booking.endTime })
        );
        
        if (conflicts.length > 0) {
          throw {
            code: BookingErrorCode.SLOT_CONFLICT,
            message: errors.SLOT_CONFLICT,
            conflicts: conflicts.map(c => ({
              startTime: c.startTime,
              endTime: c.endTime,
              userName: c.user?.name ? c.user.name.charAt(0) + "**" : undefined,
            })),
          };
        }
        
        // 11. 生成订单号
        const orderNo = `BK${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        
        // 12. 创建预约
        const booking = await tx.booking.create({
          data: {
            orderNo,
            userId,
            bookingType: type,
            venueId: venueId || null,
            coachId: coachId || null,
            courseId: params.courseId || null,
            bookingDate: new Date(date),
            startTime,
            endTime,
            originalPrice: totalPrice,
            finalPrice: totalPrice,
            playerCount: 1,
            status: "pending",
          },
        });
        
        return { id: booking.id, orderNo: booking.orderNo };
        
      }, {
        isolationLevel: "Serializable",
        timeout: concurrency.transactionTimeout,
      });
      
      return { success: true, data: result };
      
    } catch (error) {
      // 处理业务错误
      if (error && typeof error === "object" && "code" in error) {
        const bizError = error as { code: string; message: string; conflicts?: BookedSlot[] };
        return {
          success: false,
          error: {
            code: bizError.code,
            message: bizError.message,
            conflicts: bizError.conflicts,
          },
        };
      }
      
      // 处理并发冲突（Prisma 事务冲突）
      if (error instanceof Error && error.message.includes("Transaction")) {
        return {
          success: false,
          error: {
            code: BookingErrorCode.CONCURRENT_CONFLICT,
            message: errors.CONCURRENT_CONFLICT,
          },
        };
      }
      
      // 其他错误
      console.error("创建预约失败:", error);
      throw error;
    }
  }
  
  /**
   * 获取已占用时段
   */
  static async getBookedSlots(
    type: "venue" | "coach",
    resourceId: string,
    date: string
  ): Promise<BookedSlot[]> {
    const { concurrency } = bookingConfig;
    const bookingDate = new Date(date);
    
    const bookings = await prisma.booking.findMany({
      where: {
        bookingDate,
        status: { in: concurrency.activeStatuses },
        ...(type === "venue" ? { venueId: resourceId } : { coachId: resourceId }),
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        userId: true,
        user: { select: { name: true } },
      },
    });
    
    return bookings.map(booking => ({
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      userId: booking.userId,
      userName: booking.user?.name 
        ? booking.user.name.charAt(0) + "**" 
        : undefined,
    }));
  }
  
  /**
   * 取消预约
   */
  static async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<BookingResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // 查询预约
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: {
            id: true,
            userId: true,
            status: true,
            version: true,
          },
        });
        
        if (!booking) {
          throw { code: "NOT_FOUND", message: "预约不存在" };
        }
        
        if (booking.userId !== userId) {
          throw { code: "FORBIDDEN", message: "无权操作此预约" };
        }
        
        if (!["pending", "confirmed"].includes(booking.status)) {
          throw { code: "INVALID_STATUS", message: "该预约状态不可取消" };
        }
        
        // 乐观锁更新
        const updated = await tx.booking.updateMany({
          where: {
            id: bookingId,
            version: booking.version,
          },
          data: {
            status: "cancelled",
            cancelReason: reason,
            version: { increment: 1 },
          },
        });
        
        if (updated.count === 0) {
          throw { code: BookingErrorCode.CONCURRENT_CONFLICT, message: "操作冲突，请刷新后重试" };
        }
        
        return { id: bookingId, orderNo: "" };
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
      
      console.error("取消预约失败:", error);
      throw error;
    }
  }
  
  /**
   * 清理过期的待支付订单
   * 
   * 应由定时任务调用
   */
  static async cleanupExpiredBookings(): Promise<number> {
    const { paymentTimeout } = bookingConfig.concurrency;
    const expireTime = new Date(Date.now() - paymentTimeout * 60 * 1000);
    
    const result = await prisma.booking.updateMany({
      where: {
        status: "pending",
        createdAt: { lt: expireTime },
      },
      data: {
        status: "cancelled",
        cancelReason: "支付超时自动取消",
      },
    });
    
    return result.count;
  }
}
