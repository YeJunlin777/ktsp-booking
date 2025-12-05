import { NextRequest } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 获取教练详情
 * 
 * GET /api/admin/coaches/[id]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        schedules: {
          where: {
            date: { gte: new Date() },
          },
          orderBy: [
            { date: "asc" },
            { startTime: "asc" },
          ],
          take: 50,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练");
    }

    return success({
      ...coach,
      price: Number(coach.price),
      rating: Number(coach.rating),
      specialty: coach.specialty || [],
      certifications: coach.certifications || [],
    });
  } catch (error) {
    console.error("获取教练详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 编辑教练
 * 
 * PUT /api/admin/coaches/[id]
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 检查教练是否存在
    const existing = await prisma.coach.findUnique({
      where: { id },
    });

    if (!existing) {
      return Errors.NOT_FOUND("教练");
    }

    const {
      name,
      avatar,
      title,
      introduction,
      specialty,
      certifications,
      experience,
      price,
      status,
      sortOrder,
    } = body;

    // 更新教练
    const coach = await prisma.coach.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(avatar !== undefined && { avatar }),
        ...(title !== undefined && { title }),
        ...(introduction !== undefined && { introduction }),
        ...(specialty !== undefined && { specialty }),
        ...(certifications !== undefined && { certifications }),
        ...(experience !== undefined && { experience }),
        ...(price !== undefined && { price }),
        ...(status !== undefined && { status }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });

    return success({
      id: coach.id,
      name: coach.name,
      message: "教练信息已更新",
    });
  } catch (error) {
    console.error("更新教练失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 删除教练
 * 
 * DELETE /api/admin/coaches/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 检查教练是否存在
    const existing = await prisma.coach.findUnique({
      where: { id },
      select: {
        id: true,
        avatar: true,
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!existing) {
      return Errors.NOT_FOUND("教练");
    }

    // 检查是否有关联预约
    if (existing._count.bookings > 0) {
      return Errors.INVALID_PARAMS("该教练有关联预约记录，无法删除。建议设置为离职状态。");
    }

    // 删除头像文件（如果是本地上传的）
    if (existing.avatar && existing.avatar.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", existing.avatar);
        await unlink(filePath);
      } catch {
        // 文件不存在或删除失败，不阻塞流程
      }
    }

    // 删除教练及其排班
    await prisma.$transaction([
      prisma.coachSchedule.deleteMany({ where: { coachId: id } }),
      prisma.coach.delete({ where: { id } }),
    ]);

    return success({
      message: "教练已删除",
    });
  } catch (error) {
    console.error("删除教练失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
