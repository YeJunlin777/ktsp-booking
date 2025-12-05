import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";

/**
 * 积分商品列表 API
 * 
 * GET /api/products
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

    if (category && category !== "all") {
      where.category = category;
    }

    // 查询商品列表
    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        name: true,
        images: true,
        points: true,
        originalPoints: true,
        stock: true,
        category: true,
        description: true,
      },
    });

    // 格式化返回数据
    const formattedProducts = products.map(({ images, ...product }) => ({
      ...product,
      image: Array.isArray(images) && images.length > 0 ? images[0] as string : null,
      points: Number(product.points),
      originalPoints: product.originalPoints ? Number(product.originalPoints) : null,
    }));

    return success(formattedProducts);
  } catch (error) {
    console.error("获取商品列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
