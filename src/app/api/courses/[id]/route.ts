import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 课程详情 API
 * 
 * GET /api/courses/[id]
 * 
 * 返回课程详情，包含当前用户的报名状态
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 获取当前用户（可选，用于判断报名状态）
    let userId = await getCurrentUserId();
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }

    // 单次查询：课程 + 报名人数 + 用户报名状态
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { in: ["pending", "confirmed"] } },
            },
          },
        },
        // 同时查询当前用户的报名记录
        bookings: userId ? {
          where: {
            userId,
            status: { in: ["pending", "confirmed"] },
          },
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          take: 1,
        } : false,
      },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程不存在");
    }

    // 实时计算报名人数
    const enrolled = course._count.bookings;

    // 用户报名状态
    const userBooking = course.bookings?.[0];
    const userEnrollment = userBooking ? {
      bookingId: userBooking.id,
      status: userBooking.status,
      enrolledAt: userBooking.createdAt.toISOString(),
    } : null;

    // 格式化返回数据
    const formattedCourse = {
      id: course.id,
      name: course.name,
      description: course.description,
      image: course.image,
      category: course.category || "beginner",
      level: "beginner",
      coachId: course.coachId,
      coachName: course.coachName || "待定",
      syllabus: course.syllabus,
      totalLessons: course.totalLessons,
      capacity: course.maxStudents,
      enrolled,
      price: Number(course.price),
      startTime: course.startDate.toISOString(),
      endTime: course.endDate.toISOString(),
      enrollDeadline: course.enrollDeadline?.toISOString() || null,
      schedule: course.schedule,
      requirements: course.requirements,
      location: "KTSP高尔夫球场",
      duration: 90,
      status: course.status,
      // 用户报名状态
      userEnrollment,
    };

    return success(formattedCourse);
  } catch (error) {
    console.error("获取课程详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
