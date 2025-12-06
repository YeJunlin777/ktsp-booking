import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

// 自动计算课程状态
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
  if (enrollDeadline && now >= enrollDeadline) return "pending";
  
  return "enrolling";
}

/**
 * 管理后台 - 课程列表
 * 
 * GET /api/admin/courses
 * Query:
 * - keyword: 搜索关键词
 * - status: 状态筛选
 * - category: 分类筛选
 * - page: 页码（默认1）
 * - pageSize: 每页数量（默认20）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { coachName: { contains: keyword } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (category && category !== "all") {
      where.category = category;
    }

    // 查询总数
    const total = await prisma.course.count({ where });

    const courses = await prisma.course.findMany({
      where,
      orderBy: [
        { startDate: "desc" },
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
        description: course.description,
        image: course.image,
        category: course.category,
        coachId: course.coachId,
        coachName: course.coachName,
        totalLessons: course.totalLessons,
        maxStudents: course.maxStudents,
        enrolled,
        price: Number(course.price),
        startDate: course.startDate.toISOString().split("T")[0],
        endDate: course.endDate.toISOString().split("T")[0],
        enrollDeadline: course.enrollDeadline?.toISOString().split("T")[0] || null,
        schedule: course.schedule,
        // 自动计算状态
        status: calcCourseStatus(
          enrolled,
          course.maxStudents,
          course.startDate,
          course.endDate,
          course.enrollDeadline
        ),
        createdAt: course.createdAt.toISOString(),
      };
    });

    return success(formattedCourses, {
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

/**
 * 管理后台 - 新增课程
 * 
 * POST /api/admin/courses
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      image,
      category,
      coachId,
      coachName,
      totalLessons = 1,
      maxStudents,
      price,
      startDate,
      endDate,
      enrollDeadline,
      schedule,
      requirements,
    } = body;

    // 参数校验
    if (!name) {
      return Errors.MISSING_PARAMS("name");
    }
    if (!maxStudents || maxStudents <= 0) {
      return Errors.INVALID_PARAMS("最大人数必须大于0");
    }
    if (!price || price <= 0) {
      return Errors.INVALID_PARAMS("课程价格必须大于0");
    }
    if (!startDate || !endDate) {
      return Errors.MISSING_PARAMS("开始/结束日期");
    }

    // 创建课程
    const course = await prisma.course.create({
      data: {
        name,
        description,
        image,
        category,
        coachId,
        coachName,
        totalLessons,
        maxStudents,
        price,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        enrollDeadline: enrollDeadline ? new Date(enrollDeadline) : null,
        schedule,
        requirements,
        status: calcCourseStatus(
          0,
          maxStudents,
          new Date(startDate),
          new Date(endDate),
          enrollDeadline ? new Date(enrollDeadline) : null
        ),
      },
    });

    return success({
      id: course.id,
      name: course.name,
      message: "课程创建成功",
    });
  } catch (error) {
    console.error("创建课程失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
