import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 未读消息数量 API
 * 
 * GET /api/messages/unread-count
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
        total: 5,
        system: 1,
        booking: 2,
        activity: 1,
        invite: 1,
      });
    }

    // 按类型统计未读数量
    const counts = await prisma.message.groupBy({
      by: ["type"],
      where: {
        userId,
        isRead: false,
      },
      _count: true,
    });

    // 格式化返回
    const result: Record<string, number> = { total: 0 };
    counts.forEach((item) => {
      result[item.type] = item._count;
      result.total += item._count;
    });

    return success(result);
  } catch (error) {
    console.error("获取未读数量失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
