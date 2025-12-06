import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 复制排班
 * 
 * POST /api/admin/coaches/[id]/schedule/copy
 * 
 * Body:
 * - sourceStartDate: 源周开始日期 (YYYY-MM-DD，周日)
 * - targetStartDate: 目标周开始日期 (YYYY-MM-DD，周日)
 * 
 * 或简化版：
 * - copyLastWeek: true  // 自动复制上周到本周
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查教练是否存在
    const coach = await prisma.coach.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练");
    }

    const { sourceStartDate, targetStartDate, copyLastWeek } = body;

    let sourceStart: Date;
    let targetStart: Date;

    if (copyLastWeek) {
      // 简化版：自动计算上周和本周
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // 本周日（周日作为一周开始）
      targetStart = new Date(today);
      targetStart.setDate(today.getDate() - dayOfWeek);
      targetStart.setHours(0, 0, 0, 0);
      
      // 上周日
      sourceStart = new Date(targetStart);
      sourceStart.setDate(targetStart.getDate() - 7);
    } else {
      if (!sourceStartDate || !targetStartDate) {
        return Errors.MISSING_PARAMS("sourceStartDate, targetStartDate");
      }
      sourceStart = new Date(sourceStartDate);
      targetStart = new Date(targetStartDate);
    }

    // 计算日期范围
    const sourceEnd = new Date(sourceStart);
    sourceEnd.setDate(sourceStart.getDate() + 6);
    sourceEnd.setHours(23, 59, 59, 999);

    const targetEnd = new Date(targetStart);
    targetEnd.setDate(targetStart.getDate() + 6);

    // 查询源周的所有排班（不包括已预约的，因为时段信息会复制）
    const sourceSchedules = await prisma.coachSchedule.findMany({
      where: {
        coachId: id,
        date: {
          gte: sourceStart,
          lte: sourceEnd,
        },
      },
      select: {
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    if (sourceSchedules.length === 0) {
      return Errors.INVALID_PARAMS("源周没有排班数据可复制");
    }

    // 计算目标周的排班数据
    const newSchedules = sourceSchedules.map(schedule => {
      const sourceDate = new Date(schedule.date);
      const dayOffset = Math.floor((sourceDate.getTime() - sourceStart.getTime()) / (1000 * 60 * 60 * 24));
      
      const targetDate = new Date(targetStart);
      targetDate.setDate(targetStart.getDate() + dayOffset);

      return {
        coachId: id,
        date: targetDate,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isBooked: false,
      };
    });

    // 先删除目标周的未预约排班
    await prisma.coachSchedule.deleteMany({
      where: {
        coachId: id,
        date: {
          gte: targetStart,
          lte: targetEnd,
        },
        isBooked: false,
      },
    });

    // 批量创建新排班
    const result = await prisma.coachSchedule.createMany({
      data: newSchedules,
      skipDuplicates: true,
    });

    return success({
      sourceWeek: `${sourceStart.toISOString().split("T")[0]} ~ ${sourceEnd.toISOString().split("T")[0]}`,
      targetWeek: `${targetStart.toISOString().split("T")[0]} ~ ${targetEnd.toISOString().split("T")[0]}`,
      copiedCount: result.count,
      message: `已复制 ${result.count} 个时段`,
    });
  } catch (error) {
    console.error("复制排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
