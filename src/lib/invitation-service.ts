/**
 * 联机邀请服务层
 * 
 * 【职责】处理多人联机预约的邀请并发问题
 * 【预留】框架代码，待联机功能上线时完善
 * 
 * 数据库模型：
 * - Booking.playerCount: 预约人数
 * - BookingInvitation: 邀请记录
 */

import { prisma } from "@/lib/db";

// ==================== 类型定义 ====================

export interface InviteParams {
  bookingId: string;
  inviterId: string;
  inviteeId?: string;     // 已注册用户ID
  invitePhone?: string;   // 未注册用户手机号
}

export interface InvitationResult {
  success: boolean;
  data?: {
    invitationId: string;
    currentCount: number;  // 当前参与人数
    maxCount: number;      // 最大人数限制
  };
  error?: {
    code: string;
    message: string;
  };
}

// ==================== 错误码 ====================

export const InvitationErrorCode = {
  BOOKING_NOT_FOUND: "BOOKING_NOT_FOUND",
  NOT_OWNER: "NOT_OWNER",
  MAX_PLAYERS: "MAX_PLAYERS",
  ALREADY_INVITED: "ALREADY_INVITED",
  SELF_INVITE: "SELF_INVITE",
  INVITATION_NOT_FOUND: "INVITATION_NOT_FOUND",
  ALREADY_RESPONDED: "ALREADY_RESPONDED",
  HAS_CONFLICT: "HAS_CONFLICT",
  CONCURRENT_CONFLICT: "CONCURRENT_CONFLICT",
} as const;

// ==================== 服务类 ====================

export class InvitationService {
  
  /**
   * 发送邀请（原子性操作）
   * 
   * 防止超过人数限制
   */
  static async sendInvitation(params: InviteParams): Promise<InvitationResult> {
    const { bookingId, inviterId, inviteeId, invitePhone } = params;
    
    // 不能邀请自己
    if (inviteeId === inviterId) {
      return {
        success: false,
        error: { code: InvitationErrorCode.SELF_INVITE, message: "不能邀请自己" },
      };
    }
    
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询预约信息
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          select: {
            id: true,
            userId: true,
            playerCount: true,
            status: true,
            bookingDate: true,
            startTime: true,
            endTime: true,
          },
        });
        
        if (!booking) {
          throw { code: InvitationErrorCode.BOOKING_NOT_FOUND, message: "预约不存在" };
        }
        
        // 2. 验证是否为预约创建者
        if (booking.userId !== inviterId) {
          throw { code: InvitationErrorCode.NOT_OWNER, message: "只有预约创建者可以邀请" };
        }
        
        // 3. 检查状态
        if (!["pending", "confirmed"].includes(booking.status)) {
          throw { code: "INVALID_STATUS", message: "该预约状态不可邀请" };
        }
        
        // 4. 获取最大人数限制（从配置或预约规则）
        const maxPlayers = 4;  // TODO: 从配置读取
        
        // 5. 统计已邀请且已接受的人数
        const acceptedCount = await tx.bookingInvitation.count({
          where: {
            bookingId,
            status: "accepted",
          },
        });
        
        const currentCount = 1 + acceptedCount;  // 1 = 创建者自己
        
        if (currentCount >= maxPlayers) {
          throw { 
            code: InvitationErrorCode.MAX_PLAYERS, 
            message: `已达人数上限(${maxPlayers}人)` 
          };
        }
        
        // 6. 检查是否已邀请过
        const existingInvite = await tx.bookingInvitation.findFirst({
          where: {
            bookingId,
            OR: [
              { inviteeId: inviteeId || undefined },
              { invitePhone: invitePhone || undefined },
            ],
            status: { in: ["pending", "accepted"] },
          },
        });
        
        if (existingInvite) {
          throw { code: InvitationErrorCode.ALREADY_INVITED, message: "已邀请过该用户" };
        }
        
        // 7. 如果是已注册用户，检查是否有时段冲突
        if (inviteeId) {
          const conflictBooking = await tx.booking.findFirst({
            where: {
              userId: inviteeId,
              bookingDate: booking.bookingDate,
              status: { in: ["pending", "confirmed"] },
              OR: [
                {
                  startTime: { lt: booking.endTime },
                  endTime: { gt: booking.startTime },
                },
              ],
            },
          });
          
          if (conflictBooking) {
            throw { 
              code: InvitationErrorCode.HAS_CONFLICT, 
              message: "该用户在此时段已有预约" 
            };
          }
        }
        
        // 8. 创建邀请
        const invitation = await tx.bookingInvitation.create({
          data: {
            bookingId,
            inviterId,
            inviteeId,
            invitePhone,
            status: "pending",
          },
        });
        
        return {
          invitationId: invitation.id,
          currentCount,
          maxCount: maxPlayers,
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
      
      console.error("发送邀请失败:", error);
      throw error;
    }
  }
  
  /**
   * 接受邀请（原子性操作）
   * 
   * 防止超员和重复接受
   */
  static async acceptInvitation(
    invitationId: string, 
    userId: string
  ): Promise<InvitationResult> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        
        // 1. 查询邀请
        const invitation = await tx.bookingInvitation.findUnique({
          where: { id: invitationId },
        });
        
        if (!invitation) {
          throw { code: InvitationErrorCode.INVITATION_NOT_FOUND, message: "邀请不存在" };
        }
        
        // 2. 验证被邀请人
        if (invitation.inviteeId && invitation.inviteeId !== userId) {
          throw { code: "NOT_INVITEE", message: "您不是该邀请的接收者" };
        }
        
        // 3. 检查状态
        if (invitation.status !== "pending") {
          throw { 
            code: InvitationErrorCode.ALREADY_RESPONDED, 
            message: "该邀请已处理" 
          };
        }
        
        // 4. 查询预约信息
        const booking = await tx.booking.findUnique({
          where: { id: invitation.bookingId },
          select: {
            id: true,
            playerCount: true,
            bookingDate: true,
            startTime: true,
            endTime: true,
          },
        });
        
        if (!booking) {
          throw { code: InvitationErrorCode.BOOKING_NOT_FOUND, message: "预约不存在" };
        }
        
        // 5. 检查用户是否有时段冲突
        const conflictBooking = await tx.booking.findFirst({
          where: {
            userId,
            bookingDate: booking.bookingDate,
            status: { in: ["pending", "confirmed"] },
            startTime: { lt: booking.endTime },
            endTime: { gt: booking.startTime },
          },
        });
        
        if (conflictBooking) {
          throw { 
            code: InvitationErrorCode.HAS_CONFLICT, 
            message: "您在此时段已有预约" 
          };
        }
        
        // 6. 再次检查人数限制
        const maxPlayers = 4;
        const acceptedCount = await tx.bookingInvitation.count({
          where: {
            bookingId: invitation.bookingId,
            status: "accepted",
          },
        });
        
        if (acceptedCount + 1 >= maxPlayers) {
          throw { 
            code: InvitationErrorCode.MAX_PLAYERS, 
            message: "人数已满" 
          };
        }
        
        // 7. 原子性更新邀请状态
        const updated = await tx.bookingInvitation.updateMany({
          where: {
            id: invitationId,
            status: "pending",
          },
          data: {
            status: "accepted",
            inviteeId: userId,
            respondedAt: new Date(),
          },
        });
        
        if (updated.count === 0) {
          throw { 
            code: InvitationErrorCode.CONCURRENT_CONFLICT, 
            message: "操作冲突，请刷新后重试" 
          };
        }
        
        // 8. 更新预约人数
        await tx.booking.update({
          where: { id: invitation.bookingId },
          data: {
            playerCount: { increment: 1 },
          },
        });
        
        return {
          invitationId,
          currentCount: acceptedCount + 2,  // +1 创建者 +1 新接受
          maxCount: maxPlayers,
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
      
      console.error("接受邀请失败:", error);
      throw error;
    }
  }
  
  /**
   * 拒绝邀请
   */
  static async rejectInvitation(
    invitationId: string, 
    userId: string
  ): Promise<InvitationResult> {
    try {
      const updated = await prisma.bookingInvitation.updateMany({
        where: {
          id: invitationId,
          inviteeId: userId,
          status: "pending",
        },
        data: {
          status: "rejected",
          respondedAt: new Date(),
        },
      });
      
      if (updated.count === 0) {
        return {
          success: false,
          error: { code: "UPDATE_FAILED", message: "操作失败，请重试" },
        };
      }
      
      return { 
        success: true, 
        data: { invitationId, currentCount: 0, maxCount: 4 } 
      };
      
    } catch (error) {
      console.error("拒绝邀请失败:", error);
      throw error;
    }
  }
}
