import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * 获取首页轮播图
 * 
 * GET /api/home/banners
 */
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { status: "active" },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        image: true,
        link: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: banners,
    });
  } catch (error) {
    console.error("获取Banner失败:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "获取Banner失败" } },
      { status: 500 }
    );
  }
}
