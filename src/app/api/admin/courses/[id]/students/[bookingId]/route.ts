import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string; bookingId: string }>;
}

/**
 * 管理后台 - 移除课程学员
 * 
 * DELETE /api/admin/courses/[id]/students/[bookingId]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id, bookingId } = await params;

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程");
    }

    // 检查报名记录是否存在
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        courseId: id,
        status: { in: ["pending", "confirmed"] },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("报名记录");
    }

    // 取消报名
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "cancelled",
        cancelReason: "管理员移除",
      },
    });

    return success({
      message: `已移除学员「${booking.user?.name || "未知"}」`,
    });
  } catch (error) {
    console.error("移除学员失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
