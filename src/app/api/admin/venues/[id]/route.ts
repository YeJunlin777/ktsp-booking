import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getAdminUser } from "@/lib/admin-auth";
import { venueConfig } from "@/config";
import fs from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 场地详情 API
 * 
 * GET /api/admin/venues/[id]
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 1. 验证管理员登录
    const admin = await getAdminUser();
    if (!admin) {
      return Errors.UNAUTHORIZED("请先登录管理后台");
    }

    const { id } = await params;

    // 2. 查询场地详情
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!venue) {
      return Errors.NOT_FOUND("场地");
    }

    // 3. 格式化返回数据
    const formattedVenue = {
      ...venue,
      images: Array.isArray(venue.images) ? venue.images as string[] : [],
      facilities: Array.isArray(venue.facilities) ? venue.facilities as string[] : [],
      price: Number(venue.price),
      peakPrice: venue.peakPrice ? Number(venue.peakPrice) : null,
      typeLabel: venueConfig.venueTypes.find(t => t.key === venue.type)?.label || venue.type,
      bookingCount: venue._count.bookings,
      reviewCount: venue._count.reviews,
    };

    return success(formattedVenue);
  } catch (error) {
    console.error("获取场地详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 编辑场地 API
 * 
 * PUT /api/admin/venues/[id]
 * Body: 同 POST 参数
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 1. 验证管理员登录
    const admin = await getAdminUser();
    if (!admin) {
      return Errors.UNAUTHORIZED("请先登录管理后台");
    }

    const { id } = await params;

    // 2. 检查场地是否存在
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!existingVenue) {
      return Errors.NOT_FOUND("场地");
    }

    // 3. 解析请求体
    const body = await request.json();
    const {
      name,
      type,
      description,
      images,
      capacity,
      price,
      peakPrice,
      facilities,
      openTime,
      closeTime,
      minDuration,
      maxDuration,
      sortOrder,
    } = body;

    // 4. 参数校验
    if (name !== undefined && !name.trim()) {
      return Errors.INVALID_PARAMS("场地名称不能为空");
    }

    if (type !== undefined) {
      const validTypes = venueConfig.venueTypes.map(t => t.key);
      if (!validTypes.includes(type)) {
        return Errors.INVALID_PARAMS(`无效的场地类型，可选：${validTypes.join(", ")}`);
      }
    }

    if (price !== undefined && price < 0) {
      return Errors.INVALID_PARAMS("价格不能为负数");
    }

    // 验证时间格式
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (openTime !== undefined && !timeRegex.test(openTime)) {
      return Errors.INVALID_PARAMS("营业开始时间格式错误");
    }
    if (closeTime !== undefined && !timeRegex.test(closeTime)) {
      return Errors.INVALID_PARAMS("营业结束时间格式错误");
    }

    // 5. 检查名称是否与其他场地重复
    if (name && name.trim() !== existingVenue.name) {
      const duplicateName = await prisma.venue.findFirst({
        where: {
          name: name.trim(),
          id: { not: id },
        },
      });
      if (duplicateName) {
        return Errors.ALREADY_EXISTS("场地名称");
      }
    }

    // 6. 构建更新数据
    const updateData: Record<string, unknown> = {};
    
    if (name !== undefined) updateData.name = name.trim();
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (images !== undefined) updateData.images = images;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (price !== undefined) updateData.price = price;
    if (peakPrice !== undefined) updateData.peakPrice = peakPrice || null;
    if (facilities !== undefined) updateData.facilities = facilities;
    if (openTime !== undefined) updateData.openTime = openTime;
    if (closeTime !== undefined) updateData.closeTime = closeTime;
    if (minDuration !== undefined) updateData.minDuration = minDuration;
    if (maxDuration !== undefined) updateData.maxDuration = maxDuration;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    // 7. 更新场地
    const venue = await prisma.venue.update({
      where: { id },
      data: updateData,
    });

    return success({
      id: venue.id,
      message: "场地更新成功",
    });
  } catch (error) {
    console.error("更新场地失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 删除场地 API
 * 
 * DELETE /api/admin/venues/[id]
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    // 1. 验证管理员登录
    const admin = await getAdminUser();
    if (!admin) {
      return Errors.UNAUTHORIZED("请先登录管理后台");
    }

    const { id } = await params;

    // 2. 检查场地是否存在
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: {
              where: {
                status: { in: ["pending", "confirmed"] },
              },
            },
          },
        },
      },
    });

    if (!venue) {
      return Errors.NOT_FOUND("场地");
    }

    // 3. 检查是否有进行中的预约（不允许删除）
    if (venue._count.bookings > 0) {
      return Errors.INVALID_PARAMS(
        `该场地还有 ${venue._count.bookings} 个进行中的预约，无法删除。请先取消相关预约或将场地设为关闭状态。`
      );
    }

    // 4. 删除关联的上传图片
    if (venue.images && Array.isArray(venue.images)) {
      const publicDir = path.join(process.cwd(), "public");
      
      for (const imageUrl of venue.images) {
        // 只删除本地上传的图片（以 /uploads/ 开头）
        if (typeof imageUrl === "string" && imageUrl.startsWith("/uploads/")) {
          const filePath = path.join(publicDir, imageUrl);
          try {
            await fs.unlink(filePath);
            console.log(`已删除图片: ${filePath}`);
          } catch (err) {
            // 文件不存在或删除失败，记录日志但继续执行
            console.warn(`删除图片失败: ${filePath}`, err);
          }
        }
      }
    }

    // 5. 永久删除场地记录
    await prisma.venue.delete({ where: { id } });

    return success({
      id,
      message: "场地及关联图片已永久删除",
    });
  } catch (error) {
    console.error("删除场地失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
