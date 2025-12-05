import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 课程详情 API
 * 
 * GET /api/courses/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      return Errors.NOT_FOUND("课程不存在");
    }

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
      enrolled: course.enrolled,
      price: Number(course.price),
      startTime: course.startDate.toISOString(),
      endTime: course.endDate.toISOString(),
      enrollDeadline: course.enrollDeadline?.toISOString() || null,
      schedule: course.schedule,
      requirements: course.requirements,
      location: "KTSP高尔夫球场",
      duration: 90,
      status: course.status,
    };

    return success(formattedCourse);
  } catch (error) {
    console.error("获取课程详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
