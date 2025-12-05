import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

/**
 * 场地列表 API
 * 
 * GET /api/venues
 * Query: type - 场地类型筛选
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // 构建查询条件
    const where: Record<string, unknown> = {
      status: "active",
    };

    if (type) {
      where.type = type;
    }

    // 查询场地列表
    const venues = await prisma.venue.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        type: true,
        images: true,
        price: true,
        peakPrice: true,
        status: true,
        description: true,
      },
    });

    // 格式化返回数据
    const formattedVenues = venues.map(({ images, ...venue }) => ({
      ...venue,
      image: Array.isArray(images) && images.length > 0 ? images[0] as string : null,
      price: Number(venue.price),
      peakPrice: venue.peakPrice ? Number(venue.peakPrice) : null,
    }));

    return success(formattedVenues);
  } catch (error) {
    console.error("获取场地列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
