import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { memberConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 获取当前用户信息 API
 * 
 * GET /api/user
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

    // 查询用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        points: true,
        memberLevel: true,
        verifyStatus: true,
        createdAt: true,
      },
    });

    // 开发模式：如果用户不存在，返回模拟数据
    if (!user && DEV_SKIP_AUTH) {
      const mockUser = {
        id: DEV_USER_ID,
        name: "开发测试用户",
        phone: "13800138000",
        avatar: null,
        points: 1500,
        level: 2,
        isVerified: false,
        createdAt: new Date().toISOString(),
        levelInfo: memberConfig.levels[1],
      };
      return success(mockUser);
    }

    if (!user) {
      return Errors.NOT_FOUND("用户不存在");
    }

    // 根据积分计算等级
    const level = memberConfig.levels
      .filter((l) => user.points >= l.minPoints)
      .pop() || memberConfig.levels[0];
    
    const levelInfo = level;

    return success({
      ...user,
      level: level.level,
      isVerified: user.verifyStatus === "已认证",
      createdAt: user.createdAt.toISOString(),
      levelInfo,
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
