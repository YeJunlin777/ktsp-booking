import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 场地详情 API
 * 
 * GET /api/venues/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const venue = await prisma.venue.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        images: true,
        capacity: true,
        price: true,
        peakPrice: true,
        facilities: true,
        openTime: true,
        closeTime: true,
        minDuration: true,
        maxDuration: true,
        status: true,
      },
    });

    if (!venue) {
      return Errors.NOT_FOUND("场地不存在");
    }

    // 格式化返回数据
    const formattedVenue = {
      ...venue,
      images: Array.isArray(venue.images) ? venue.images as string[] : [],
      facilities: Array.isArray(venue.facilities) ? venue.facilities as string[] : [],
      price: Number(venue.price),
      peakPrice: venue.peakPrice ? Number(venue.peakPrice) : null,
    };

    return success(formattedVenue);
  } catch (error) {
    console.error("获取场地详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
