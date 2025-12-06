import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

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

    return success(banners);
  } catch (err) {
    console.error("获取Banner失败:", err);
    return Errors.INTERNAL_ERROR();
  }
}
