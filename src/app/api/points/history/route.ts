import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 积分历史记录 API
 * 
 * GET /api/points/history
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

    // 查询积分记录
    const records = await prisma.pointLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        points: true,
        remark: true,
        createdAt: true,
      },
    });

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && records.length === 0) {
      const mockRecords = [
        { id: "1", type: "earn", amount: 10, description: "每日签到", createdAt: new Date().toISOString() },
        { id: "2", type: "earn", amount: 50, description: "连续签到7天奖励", createdAt: new Date().toISOString() },
        { id: "3", type: "spend", amount: 100, description: "兑换商品: 高尔夫球", createdAt: new Date().toISOString() },
        { id: "4", type: "earn", amount: 200, description: "预约消费奖励", createdAt: new Date().toISOString() },
      ];
      return success(mockRecords);
    }

    // 格式化返回数据
    const formattedRecords = records.map((record) => ({
      id: record.id,
      type: record.points > 0 ? "earn" : "spend",
      amount: Math.abs(record.points),
      description: record.remark || getTypeLabel(record.type),
      createdAt: record.createdAt.toISOString(),
    }));

    return success(formattedRecords);
  } catch (error) {
    console.error("获取积分记录失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

// 获取类型标签
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    checkin: "每日签到",
    booking: "预约消费",
    redeem: "积分兑换",
    invite: "邀请好友",
    admin: "管理员调整",
  };
  return labels[type] || type;
}
