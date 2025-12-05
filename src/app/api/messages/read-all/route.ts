import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 全部消息标记已读 API
 * 
 * POST /api/messages/read-all
 */
export async function POST() {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    // 开发模式：直接返回成功
    if (DEV_SKIP_AUTH) {
      return success({ message: "已全部标记为已读" });
    }

    // 批量更新未读消息
    await prisma.message.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return success({ message: "已全部标记为已读" });
  } catch (error) {
    console.error("标记消息已读失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
