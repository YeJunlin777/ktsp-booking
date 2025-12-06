import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 课程报名学员列表
 * 
 * GET /api/admin/courses/[id]/students
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 检查课程是否存在
    const course = await prisma.course.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程");
    }

    // 查询报名的学员
    const bookings = await prisma.booking.findMany({
      where: {
        courseId: id,
        status: { in: ["pending", "confirmed", "completed"] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            nickname: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const students = bookings.map((booking) => ({
      bookingId: booking.id,
      userId: booking.user.id,
      name: booking.user.name || booking.user.nickname || "未知",
      phone: booking.user.phone,
      avatar: booking.user.avatar,
      status: booking.status,
      enrolledAt: booking.createdAt.toISOString(),
    }));

    return success({
      courseId: course.id,
      courseName: course.name,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("获取报名学员失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
