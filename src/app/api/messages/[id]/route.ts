import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 消息详情 API
 * 
 * GET /api/messages/[id]
 */
export async function GET(
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

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH) {
      const mockMessage = {
        id,
        type: "booking",
        title: "预约提醒",
        content: "您预约的高尔夫球场明天上午9:00开始，请准时到达。预约单号：BK202312050001。\n\n如需取消预约，请至少提前24小时操作。",
        isRead: true,
        createdAt: new Date().toISOString(),
      };
      return success(mockMessage);
    }

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) {
      return Errors.NOT_FOUND("消息不存在");
    }

    // 验证是本人的消息
    if (message.userId !== userId) {
      return Errors.FORBIDDEN();
    }

    // 标记为已读
    if (!message.isRead) {
      await prisma.message.update({
        where: { id },
        data: { isRead: true },
      });
    }

    return success({
      ...message,
      isRead: true,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("获取消息详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
