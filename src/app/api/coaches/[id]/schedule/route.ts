import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { coachConfig } from "@/config";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 教练排班 API（用户端）
 * 
 * GET /api/coaches/[id]/schedule
 * Query: date - 查询日期 (YYYY-MM-DD)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return Errors.INVALID_PARAMS("请选择日期");
    }

    // 获取教练信息
    const coach = await prisma.coach.findUnique({
      where: { id },
      select: {
        id: true,
        price: true,
        status: true,
      },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练不存在");
    }

    if (coach.status !== "active") {
      return success([]);
    }

    // 查询教练当天的所有排班
    const queryDate = new Date(date);
    const schedules = await prisma.coachSchedule.findMany({
      where: {
        coachId: id,
        date: queryDate,
      },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        isBooked: true,
      },
    });

    // 如果没有排班，返回空数组
    if (schedules.length === 0) {
      return success([]);
    }

    const price = Number(coach.price);

    // 构建返回数据：每个排班时段作为一个可选项
    const slots = schedules.map((schedule: typeof schedules[number]) => ({
      id: schedule.id,
      time: schedule.startTime,
      endTime: schedule.endTime,
      available: !schedule.isBooked,
      duration: coachConfig.lessonDuration.default,
      price,
    }));

    return success(slots);
  } catch (error) {
    console.error("获取教练排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
