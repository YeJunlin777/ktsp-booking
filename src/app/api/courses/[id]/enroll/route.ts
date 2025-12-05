import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { courseConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 课程报名 API
 * 
 * POST /api/courses/[id]/enroll
 */
export async function POST(
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

    // 查询课程信息
    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        maxStudents: true,
        enrolled: true,
        price: true,
        startDate: true,
        enrollDeadline: true,
        status: true,
      },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程不存在");
    }

    // 检查课程状态
    if (course.status !== "enrolling" && course.status !== "active") {
      return Errors.INVALID_PARAMS("课程暂不可报名");
    }

    // 检查名额
    if (course.enrolled >= course.maxStudents) {
      return Errors.INVALID_PARAMS(courseConfig.texts.fullButton);
    }

    // 检查报名截止时间
    if (course.enrollDeadline && new Date() > course.enrollDeadline) {
      return Errors.INVALID_PARAMS("报名已截止");
    }

    // 检查是否已报名
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId,
        courseId: id,
        status: { in: ["pending", "confirmed"] },
      },
    });

    if (existingBooking) {
      return Errors.INVALID_PARAMS("您已报名此课程");
    }

    // 生成订单号
    const orderNo = `CE${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 使用事务处理报名
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建预约订单
      const booking = await tx.booking.create({
        data: {
          orderNo,
          userId,
          courseId: id,
          bookingType: "course",
          bookingDate: course.startDate,
          startTime: "00:00",
          endTime: "00:00",
          originalPrice: course.price,
          finalPrice: course.price,
          status: "confirmed",
        },
      });

      // 2. 更新课程报名人数
      const updatedCourse = await tx.course.update({
        where: { id },
        data: {
          enrolled: { increment: 1 },
          status: course.enrolled + 1 >= course.maxStudents ? "full" : "enrolling",
        },
      });

      return { booking, course: updatedCourse };
    });

    return success({
      bookingId: result.booking.id,
      message: courseConfig.texts.enrollSuccess,
    });
  } catch (error) {
    console.error("课程报名失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
