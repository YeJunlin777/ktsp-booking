import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

/**
 * 自动计算课程状态
 */
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
  if (enrollDeadline && now >= enrollDeadline) return "pending"; // 待开课
  
  return "enrolling";
}

/**
 * 课程列表 API
 * 
 * GET /api/courses
 * Query: 
 *   - category: 分类筛选
 *   - page: 页码（默认1）
 *   - pageSize: 每页数量（默认10）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // 构建查询条件 - 只查询未结束的课程
    const where: Record<string, unknown> = {
      endDate: { gte: new Date() },
    };

    if (category && category !== "all") {
      where.category = category;
    }

    // 查询总数
    const total = await prisma.course.count({ where });

    // 查询课程列表（分页）
    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { startDate: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: {
            bookings: {
              where: { status: { in: ["pending", "confirmed", "completed"] } },
            },
          },
        },
      },
    });

    // 格式化返回数据
    const formattedCourses = courses.map((course) => {
      const enrolled = course._count.bookings;
      return {
        id: course.id,
        name: course.name,
        image: course.image,
        category: course.category || "beginner",
        level: "beginner", // 默认级别
        coachName: course.coachName || "待定",
        startTime: course.startDate.toISOString(),
        enrollDeadline: course.enrollDeadline?.toISOString() || null,
        duration: 90, // 默认90分钟
        capacity: course.maxStudents,
        enrolled,
        price: Number(course.price),
        status: calcCourseStatus(
          enrolled,
          course.maxStudents,
          course.startDate,
          course.endDate,
          course.enrollDeadline
        ),
      };
    });

    // 返回所有未结束的课程（排除 ended）
    const activeCourses = formattedCourses.filter(c => c.status !== "ended");

    return success(activeCourses, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("获取课程列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
