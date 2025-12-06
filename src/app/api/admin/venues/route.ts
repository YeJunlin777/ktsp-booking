import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, successWithPagination, Errors } from "@/lib/response";
import { getAdminUser } from "@/lib/admin-auth";
import { venueConfig } from "@/config";

/**
 * 管理后台 - 场地列表 API
 * 
 * GET /api/admin/venues
 * Query: 
 *   - page: 页码（默认1）
 *   - pageSize: 每页数量（默认20）
 *   - type: 场地类型筛选
 *   - status: 状态筛选
 *   - keyword: 关键词搜索
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 验证管理员登录
    const admin = await getAdminUser();
    if (!admin) {
      return Errors.UNAUTHORIZED("请先登录管理后台");
    }

    // 2. 解析查询参数
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20")));
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const keyword = searchParams.get("keyword");

    // 3. 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (keyword) {
      where.name = { contains: keyword };
    }

    // 4. 查询总数
    const total = await prisma.venue.count({ where });

    // 5. 查询列表
    const venues = await prisma.venue.findMany({
      where,
      orderBy: [
        { sortOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
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
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    // 6. 格式化返回数据
    const formattedVenues = venues.map((venue) => ({
      ...venue,
      images: Array.isArray(venue.images) ? venue.images as string[] : [],
      facilities: Array.isArray(venue.facilities) ? venue.facilities as string[] : [],
      price: Number(venue.price),
      peakPrice: venue.peakPrice ? Number(venue.peakPrice) : null,
      typeLabel: venueConfig.venueTypes.find(t => t.key === venue.type)?.label || venue.type,
      bookingCount: venue._count.bookings,
      reviewCount: venue._count.reviews,
    }));

    return successWithPagination(formattedVenues, page, pageSize, total);
  } catch (error) {
    console.error("获取场地列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 新增场地 API
 * 
 * POST /api/admin/venues
 * Body: {
 *   name: string,
 *   type: string,
 *   description?: string,
 *   images?: string[],
 *   capacity?: number,
 *   price: number,
 *   peakPrice?: number,
 *   facilities?: string[],
 *   openTime?: string,
 *   closeTime?: string,
 *   minDuration?: number,
 *   maxDuration?: number,
 *   sortOrder?: number,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 验证管理员登录
    const admin = await getAdminUser();
    if (!admin) {
      return Errors.UNAUTHORIZED("请先登录管理后台");
    }

    // 2. 解析请求体
    const body = await request.json();
    const {
      name,
      type,
      description,
      images,
      capacity = 1,
      price,
      peakPrice,
      facilities,
      openTime = "08:00",
      closeTime = "22:00",
      minDuration = 30,
      maxDuration = 240,
      sortOrder = 0,
    } = body;

    // 3. 参数校验
    if (!name || !name.trim()) {
      return Errors.MISSING_PARAMS("场地名称");
    }

    if (!type) {
      return Errors.MISSING_PARAMS("场地类型");
    }

    // 验证场地类型是否有效
    const validTypes = venueConfig.venueTypes.map(t => t.key);
    if (!validTypes.includes(type)) {
      return Errors.INVALID_PARAMS(`无效的场地类型，可选：${validTypes.join(", ")}`);
    }

    if (price === undefined || price === null || price < 0) {
      return Errors.INVALID_PARAMS("请填写有效的价格");
    }

    // 验证时间格式
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(openTime) || !timeRegex.test(closeTime)) {
      return Errors.INVALID_PARAMS("营业时间格式错误，请使用 HH:mm 格式");
    }

    // 4. 检查名称是否重复
    const existingVenue = await prisma.venue.findFirst({
      where: { name: name.trim() },
    });
    if (existingVenue) {
      return Errors.ALREADY_EXISTS("场地名称");
    }

    // 5. 创建场地
    const venue = await prisma.venue.create({
      data: {
        name: name.trim(),
        type,
        description: description?.trim() || null,
        images: images || [],
        capacity,
        price,
        peakPrice: peakPrice || null,
        facilities: facilities || [],
        openTime,
        closeTime,
        minDuration,
        maxDuration,
        sortOrder,
        status: "active",
      },
    });

    return success({
      id: venue.id,
      message: "场地创建成功",
    });
  } catch (error) {
    console.error("创建场地失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
