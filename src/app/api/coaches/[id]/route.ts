import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 教练详情 API
 * 
 * GET /api/coaches/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const coach = await prisma.coach.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        introduction: true,
        specialty: true,
        certifications: true,
        experience: true,
        price: true,
        rating: true,
        reviewCount: true,
        lessonCount: true,
        status: true,
      },
    });

    if (!coach) {
      return Errors.NOT_FOUND("教练不存在");
    }

    // 格式化返回数据
    const formattedCoach = {
      ...coach,
      specialty: Array.isArray(coach.specialty) ? coach.specialty as string[] : [],
      certifications: Array.isArray(coach.certifications) ? coach.certifications as string[] : [],
      price: Number(coach.price),
      rating: Number(coach.rating),
    };

    return success(formattedCoach);
  } catch (error) {
    console.error("获取教练详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
