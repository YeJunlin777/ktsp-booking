import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 获取教练排班
 * 
 * GET /api/admin/coaches/[id]/schedule
 * 
 * 查询参数：
 * - startDate: 开始日期 YYYY-MM-DD
 * - endDate: 结束日期 YYYY-MM-DD
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    // 默认查询未来14天
    const startDate = searchParams.get("startDate") 
      ? new Date(searchParams.get("startDate")!) 
      : new Date();
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // 检查教练是否存在
    const coach = await prisma.coach.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练");
    }

    // 查询排班
    const schedules = await prisma.coachSchedule.findMany({
      where: {
        coachId: id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    // 按日期分组
    const groupedSchedules: Record<string, typeof schedules> = {};
    schedules.forEach((schedule: typeof schedules[number]) => {
      const dateKey = schedule.date.toISOString().split("T")[0];
      if (!groupedSchedules[dateKey]) {
        groupedSchedules[dateKey] = [];
      }
      groupedSchedules[dateKey].push(schedule);
    });

    return success({
      coachId: id,
      coachName: coach.name,
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      schedules: groupedSchedules,
    });
  } catch (error) {
    console.error("获取教练排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 设置教练排班
 * 
 * PUT /api/admin/coaches/[id]/schedule
 * 
 * Body:
 * {
 *   date: "2024-01-15",  // 日期
 *   slots: [
 *     { startTime: "09:00", endTime: "10:00" },
 *     { startTime: "10:00", endTime: "11:00" },
 *   ]
 * }
 * 
 * 或批量设置：
 * {
 *   schedules: [
 *     { date: "2024-01-15", startTime: "09:00", endTime: "10:00" },
 *     { date: "2024-01-15", startTime: "10:00", endTime: "11:00" },
 *   ]
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查教练是否存在
    const coach = await prisma.coach.findUnique({
      where: { id },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练");
    }

    const { date, slots, schedules } = body;

    // 处理单日期多时段
    if (date && slots && Array.isArray(slots)) {
      const targetDate = new Date(date);
      
      // 删除该日期的现有排班（未被预约的）
      await prisma.coachSchedule.deleteMany({
        where: {
          coachId: id,
          date: targetDate,
          isBooked: false,
        },
      });

      // 创建新排班
      const newSchedules = slots.map((slot: { startTime: string; endTime: string }) => ({
        coachId: id,
        date: targetDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: false,
      }));

      await prisma.coachSchedule.createMany({
        data: newSchedules,
        skipDuplicates: true,  // 跳过重复记录（基于唯一约束）
      });

      return success({
        date,
        count: newSchedules.length,
        message: `已设置${newSchedules.length}个时段`,
      });
    }

    // 处理批量排班
    if (schedules && Array.isArray(schedules)) {
      // 获取所有涉及的日期
      const dates = [...new Set(schedules.map((s: { date: string }) => s.date))];
      
      // 删除这些日期的未预约排班
      for (const d of dates) {
        await prisma.coachSchedule.deleteMany({
          where: {
            coachId: id,
            date: new Date(d),
            isBooked: false,
          },
        });
      }

      // 创建新排班
      const newSchedules = schedules.map((s: { date: string; startTime: string; endTime: string }) => ({
        coachId: id,
        date: new Date(s.date),
        startTime: s.startTime,
        endTime: s.endTime,
        isBooked: false,
      }));

      await prisma.coachSchedule.createMany({
        data: newSchedules,
        skipDuplicates: true,  // 跳过重复记录（基于唯一约束）
      });

      return success({
        dates,
        count: newSchedules.length,
        message: `已设置${newSchedules.length}个时段`,
      });
    }

    return Errors.INVALID_PARAMS("请提供排班数据");
  } catch (error) {
    console.error("设置教练排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 删除教练排班
 * 
 * DELETE /api/admin/coaches/[id]/schedule
 * 
 * 查询参数：
 * - date: 删除指定日期的所有排班
 * - scheduleId: 删除指定排班
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const scheduleId = searchParams.get("scheduleId");

    if (scheduleId) {
      // 删除指定排班
      const schedule = await prisma.coachSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        return Errors.NOT_FOUND("排班记录");
      }

      if (schedule.isBooked) {
        return Errors.INVALID_PARAMS("该时段已被预约，无法删除");
      }

      await prisma.coachSchedule.delete({
        where: { id: scheduleId },
      });

      return success({ message: "排班已删除" });
    }

    if (date) {
      // 删除指定日期的所有未预约排班
      const result = await prisma.coachSchedule.deleteMany({
        where: {
          coachId: id,
          date: new Date(date),
          isBooked: false,
        },
      });

      return success({
        date,
        deletedCount: result.count,
        message: `已删除${result.count}个时段`,
      });
    }

    return Errors.INVALID_PARAMS("请指定要删除的日期或排班ID");
  } catch (error) {
    console.error("删除教练排班失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
