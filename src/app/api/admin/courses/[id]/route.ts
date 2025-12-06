import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 课程详情
 * 
 * GET /api/admin/courses/[id]
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
      return Errors.NOT_FOUND("课程");
    }

    return success({
      ...course,
      price: Number(course.price),
      startDate: course.startDate.toISOString().split("T")[0],
      endDate: course.endDate.toISOString().split("T")[0],
      enrollDeadline: course.enrollDeadline?.toISOString().split("T")[0] || null,
    });
  } catch (error) {
    console.error("获取课程详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 编辑课程
 * 
 * PUT /api/admin/courses/[id]
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查课程是否存在
    const existing = await prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      return Errors.NOT_FOUND("课程");
    }

    const {
      name,
      description,
      image,
      category,
      coachId,
      coachName,
      totalLessons,
      maxStudents,
      price,
      startDate,
      endDate,
      enrollDeadline,
      schedule,
      requirements,
      status,
    } = body;

    // 更新课程
    const course = await prisma.course.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(coachId !== undefined && { coachId }),
        ...(coachName !== undefined && { coachName }),
        ...(totalLessons !== undefined && { totalLessons }),
        ...(maxStudents !== undefined && { maxStudents }),
        ...(price !== undefined && { price }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: new Date(endDate) }),
        ...(enrollDeadline !== undefined && { 
          enrollDeadline: enrollDeadline ? new Date(enrollDeadline) : null 
        }),
        ...(schedule !== undefined && { schedule }),
        ...(requirements !== undefined && { requirements }),
        ...(status !== undefined && { status }),
      },
    });

    return success({
      id: course.id,
      name: course.name,
      message: "课程信息已更新",
    });
  } catch (error) {
    console.error("更新课程失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 删除课程
 * 
 * DELETE /api/admin/courses/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // 检查课程是否存在
    const existing = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        enrolled: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing) {
      return Errors.NOT_FOUND("课程");
    }

    // 检查是否有报名
    if (existing._count.bookings > 0) {
      return Errors.INVALID_PARAMS("该课程有报名记录，无法删除。建议设置为已结束状态。");
    }

    // 删除课程
    await prisma.course.delete({
      where: { id },
    });

    return success({
      message: "课程已删除",
    });
  } catch (error) {
    console.error("删除课程失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
