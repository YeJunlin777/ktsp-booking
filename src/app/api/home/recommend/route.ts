import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { homeConfig } from "@/config";

/**
 * 获取推荐场地
 * 
 * GET /api/home/recommend
 * 
 * 【逻辑】
 * 1. 未登录：返回默认推荐（按排序）
 * 2. 已登录：根据历史预约记录智能推荐
 */
export async function GET() {
  try {
    // TODO: 实现智能推荐逻辑
    // 目前返回默认排序的场地
    const venues = await prisma.venue.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
      take: homeConfig.recommend.defaultCount,
      select: {
        id: true,
        name: true,
        type: true,
        images: true,
        price: true,
        status: true,
      },
    });

    // 处理图片字段（取第一张，移除 images 数组）
    const formattedVenues = venues.map(({ images, ...venue }) => ({
      ...venue,
      image: Array.isArray(images) && images.length > 0 
        ? images[0] as string
        : null,
      price: Number(venue.price),
    }));

    return NextResponse.json({
      success: true,
      data: formattedVenues,
    });
  } catch (error) {
    console.error("获取推荐场地失败:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取推荐场地失败" } },
      { status: 500 }
    );
  }
}
