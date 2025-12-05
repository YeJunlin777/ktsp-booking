import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { pointsConfig } from "@/config";
import { getTodayStart } from "@/lib/utils/index";

/**
 * 签到 API
 * 
 * 【配置化】所有规则从 pointsConfig 读取
 * 后续项目只需修改配置文件即可复用
 */

// POST /api/checkin - 执行签到
export async function POST() {
  try {
    // 1. 验证登录
    const userId = await getCurrentUserId();
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    // 2. 获取签到配置
    const { checkin } = pointsConfig;
    const today = getTodayStart();

    // 3. 检查今日是否已签到
    const existingCheckin = await prisma.checkin.findUnique({
      where: {
        userId_checkinDate: {
          userId,
          checkinDate: today,
        },
      },
    });

    if (existingCheckin) {
      return Errors.ALREADY_CHECKED_IN();
    }

    // 4. 查询昨天的签到记录，计算连续天数
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayCheckin = await prisma.checkin.findFirst({
      where: {
        userId,
        checkinDate: {
          gte: new Date(yesterday.setHours(0, 0, 0, 0)),
          lt: new Date(yesterday.setHours(23, 59, 59, 999)),
        },
      },
    });

    // 5. 计算连续签到天数
    const streakDays = yesterdayCheckin ? yesterdayCheckin.streakDays + 1 : 1;

    // 6. 计算本次获得的积分（从配置读取）
    let earnedPoints = checkin.basePoints;
    
    // 检查连续签到奖励
    for (const bonus of checkin.streakBonus) {
      if (streakDays === bonus.days) {
        earnedPoints = bonus.points;
        break;
      }
    }

    // 7. 事务：创建签到记录 + 更新用户积分 + 创建积分流水
    const result = await prisma.$transaction(async (tx) => {
      // 创建签到记录
      const checkinRecord = await tx.checkin.create({
        data: {
          userId,
          checkinDate: today,
          points: earnedPoints,
          streakDays,
        },
      });

      // 获取当前用户积分
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { points: true },
      });

      const newBalance = (user?.points || 0) + earnedPoints;

      // 更新用户积分
      await tx.user.update({
        where: { id: userId },
        data: { points: newBalance },
      });

      // 创建积分流水
      await tx.pointLog.create({
        data: {
          userId,
          type: "checkin",
          points: earnedPoints,
          balance: newBalance,
          remark: streakDays > 1 
            ? `连续签到${streakDays}天` 
            : "每日签到",
          relatedId: checkinRecord.id,
        },
      });

      return {
        points: earnedPoints,
        streakDays,
        totalPoints: newBalance,
        isStreakBonus: streakDays > 1 && checkin.streakBonus.some(b => b.days === streakDays),
      };
    });

    return success(result);
  } catch (error) {
    console.error("签到失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

// GET /api/checkin - 获取签到状态
export async function GET(_request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const today = getTodayStart();

    // 查询今日签到状态
    const todayCheckin = await prisma.checkin.findUnique({
      where: {
        userId_checkinDate: {
          userId,
          checkinDate: today,
        },
      },
    });

    // 查询本月签到记录
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const monthCheckins = await prisma.checkin.findMany({
      where: {
        userId,
        checkinDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      select: {
        checkinDate: true,
        points: true,
        streakDays: true,
      },
      orderBy: { checkinDate: "asc" },
    });

    // 获取用户当前积分
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    return success({
      isCheckedIn: !!todayCheckin,
      todayPoints: todayCheckin?.points || 0,
      streakDays: todayCheckin?.streakDays || 0,
      totalPoints: user?.points || 0,
      monthCheckins: monthCheckins.map((c) => ({
        date: c.checkinDate.toISOString().split("T")[0],
        points: c.points,
        streakDays: c.streakDays,
      })),
      monthCount: monthCheckins.length,
    });
  } catch (error) {
    console.error("获取签到状态失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
