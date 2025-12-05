import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { messageConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 消息列表 API
 * 
 * GET /api/messages
 * Query: type - 消息类型筛选
 */
export async function GET(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // 构建查询条件
    const where: Record<string, unknown> = { userId };
    
    if (type && type !== "all") {
      where.type = type;
    }

    // 查询消息列表
    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: messageConfig.rules.pageSize,
      select: {
        id: true,
        type: true,
        title: true,
        content: true,
        isRead: true,
        createdAt: true,
      },
    });

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && messages.length === 0) {
      const mockMessages = [
        {
          id: "1",
          type: "booking",
          title: "预约提醒",
          content: "您预约的高尔夫球场明天上午9:00开始，请准时到达。",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          type: "system",
          title: "系统通知",
          content: "您的账户已成功升级为银卡会员，享受更多专属权益。",
          isRead: true,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "3",
          type: "activity",
          title: "活动通知",
          content: "双十一特惠活动开始啦！预约场地享8折优惠，限时3天！",
          isRead: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "4",
          type: "invite",
          title: "邀请通知",
          content: "用户张三邀请您参加12月10日的多人联机预约。",
          isRead: true,
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
      
      // 过滤类型
      const filteredMessages = type && type !== "all"
        ? mockMessages.filter((m) => m.type === type)
        : mockMessages;
        
      return success(filteredMessages);
    }

    // 格式化返回数据
    const formattedMessages = messages.map((message) => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    }));

    return success(formattedMessages);
  } catch (error) {
    console.error("获取消息列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
