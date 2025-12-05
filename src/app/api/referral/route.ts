import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { referralConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 获取邀请信息 API
 * 
 * GET /api/referral
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

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH) {
      return success({
        inviteCode: "KTSP2024",
        inviteCount: 5,
        totalPoints: 500,
        records: [
          {
            id: "1",
            inviteeName: "张**",
            status: "completed",
            points: referralConfig.rewards.inviterPoints,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            inviteeName: "李**",
            status: "completed",
            points: referralConfig.rewards.inviterPoints,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "3",
            inviteeName: "王**",
            status: "pending",
            points: 0,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
      });
    }

    // 查询用户信息获取邀请码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { inviteCode: true },
    });

    if (!user) {
      return Errors.NOT_FOUND("用户不存在");
    }

    // 生成邀请码（如果不存在）
    const inviteCode = user.inviteCode || `KTSP${userId.slice(-6).toUpperCase()}`;

    // TODO: 查询邀请记录（需要创建 InviteRecord 表）
    // 暂时返回空记录
    return success({
      inviteCode,
      inviteCount: 0,
      totalPoints: 0,
      records: [],
    });
  } catch (error) {
    console.error("获取邀请信息失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
