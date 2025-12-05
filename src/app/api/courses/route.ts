import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

/**
 * 课程列表 API
 * 
 * GET /api/courses
 * Query: category - 分类筛选
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: { in: ["active", "enrolling", "full"] },
    };

    if (category && category !== "all") {
      where.category = category;
    }

    // 查询课程列表
    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { startDate: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        image: true,
        category: true,
        coachName: true,
        maxStudents: true,
        enrolled: true,
        price: true,
        startDate: true,
        totalLessons: true,
        status: true,
      },
    });

    // 格式化返回数据
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      image: course.image,
      category: course.category || "beginner",
      level: "beginner", // 默认级别
      coachName: course.coachName || "待定",
      startTime: course.startDate.toISOString(),
      duration: 90, // 默认90分钟
      capacity: course.maxStudents,
      enrolled: course.enrolled,
      price: Number(course.price),
      status: course.status,
    }));

    return success(formattedCourses);
  } catch (error) {
    console.error("获取课程列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
