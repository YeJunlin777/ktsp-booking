import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { coachConfig } from "@/config";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 生成时段列表
 */
function generateTimeSlots(startHour: number, endHour: number, _duration: number) {
  const slots: string[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    const timeStr = `${String(hour).padStart(2, "0")}:00`;
    slots.push(timeStr);
  }

  return slots;
}

/**
 * 教练排班 API
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

    // 查询教练当天的排班
    const queryDate = new Date(date);
    const schedule = await prisma.coachSchedule.findFirst({
      where: {
        coachId: id,
        date: queryDate,
        isBooked: false,
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // 如果没有排班或已被整体预约，返回空数组
    if (!schedule) {
      return success([]);
    }

    // 生成可用时段
    const startHour = parseInt(schedule.startTime.split(":")[0], 10);
    const endHour = parseInt(schedule.endTime.split(":")[0], 10);
    const allSlots = generateTimeSlots(startHour, endHour, coachConfig.lessonDuration.default);

    // 查询当天已预约的时段
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const bookedRecords = await prisma.booking.findMany({
      where: {
        coachId: id,
        bookingDate: {
          gte: queryDate,
          lt: nextDate,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
      select: {
        startTime: true,
      },
    });

    const bookedTimes = new Set(bookedRecords.map((b) => b.startTime));
    const price = Number(coach.price);

    // 构建返回数据
    const slots = allSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
      duration: coachConfig.lessonDuration.default,
      price,
    }));

    return success(slots);
  } catch (error) {
    console.error("获取教练排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
