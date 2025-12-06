import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

/**
 * 教练列表 API
 * 
 * GET /api/coaches
 * Query: category - 分类筛选
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: "active",
    };

    // 分类筛选（通过 specialty 数组匹配）
    if (category && category !== "all") {
      where.specialty = {
        has: category,
      };
    }

    // 查询教练列表（排序权重优先，然后按评分）
    const coaches = await prisma.coach.findMany({
      where,
      orderBy: [
        { sortOrder: "desc" },
        { rating: "desc" },
        { reviewCount: "desc" },
      ],
      select: {
        id: true,
        name: true,
        avatar: true,
        title: true,
        specialty: true,
        experience: true,
        rating: true,
        reviewCount: true,
        price: true,
        status: true,
      },
    });

    // 格式化返回数据
    const formattedCoaches = coaches.map((coach) => ({
      ...coach,
      specialty: Array.isArray(coach.specialty) ? coach.specialty as string[] : [],
      price: Number(coach.price),
      rating: Number(coach.rating),
    }));

    return success(formattedCoaches);
  } catch (error) {
    console.error("获取教练列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
