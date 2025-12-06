import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { courseConfig } from "@/config";

// 计算课程状态（与列表/详情保持一致）
function calcCourseStatus(
  enrolled: number,
  maxStudents: number,
  startDate: Date,
  endDate: Date,
  enrollDeadline: Date | null
): string {
  const now = new Date();

  if (now >= endDate) return "ended";
  if (now >= startDate) return "ongoing";
  if (enrolled >= maxStudents) return "full";
  if (enrollDeadline && now >= enrollDeadline) return "pending"; // 报名截止待开课

  return "enrolling";
}

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
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
        price: true,
        startDate: true,
        endDate: true,
        enrollDeadline: true,
      },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程不存在");
    }

    const now = new Date();

    // 基础时间校验（统一入口）
    if (now >= course.endDate) {
      return Errors.INVALID_PARAMS("课程已结束");
    }
    if (now >= course.startDate) {
      return Errors.INVALID_PARAMS("课程进行中，暂不可报名");
    }
    if (course.enrollDeadline && now > course.enrollDeadline) {
      return Errors.INVALID_PARAMS("报名已截止");
    }

    // 生成订单号
    const orderNo = `CE${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // 使用事务处理报名
    const result = await prisma.$transaction(async (tx) => {
      // 并发下先查当前有效报名数
      const activeCount = await tx.booking.count({
        where: {
          courseId: id,
          status: { in: ["pending", "confirmed"] },
        },
      });

      // 再次容量校验（事务内防超卖）
      if (activeCount >= course.maxStudents) {
        throw Errors.INVALID_PARAMS(courseConfig.texts.fullButton);
      }

      // 检查是否已报名（事务内防并发重复）
      const existingBooking = await tx.booking.findFirst({
        where: {
          userId,
          courseId: id,
          status: { in: ["pending", "confirmed"] },
        },
      });

      if (existingBooking) {
        throw Errors.INVALID_PARAMS("您已报名此课程");
      }

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

      // 2. 更新课程状态（基于实时报名人数）
      const newEnrolled = activeCount + 1;
      const newStatus = calcCourseStatus(
        newEnrolled,
        course.maxStudents,
        course.startDate,
        course.endDate,
        course.enrollDeadline
      );

      const updatedCourse = await tx.course.update({
        where: { id },
        data: {
          status: newStatus,
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
