import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, successWithPagination, Errors } from "@/lib/response";

/**
 * 管理后台 - 教练列表
 * 
 * GET /api/admin/coaches
 * 
 * 查询参数：
 * - keyword: 搜索关键词（姓名）
 * - status: 状态筛选
 * - page: 页码
 * - pageSize: 每页条数
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 构建查询条件
    const where: Record<string, unknown> = {};
    
    if (keyword) {
      where.name = { contains: keyword };
    }
    
    if (status) {
      where.status = status;
    }

    // 查询总数
    const total = await prisma.coach.count({ where });

    // 查询列表
    const coaches = await prisma.coach.findMany({
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
        avatar: true,
        title: true,
        specialty: true,
        experience: true,
        price: true,
        rating: true,
        reviewCount: true,
        lessonCount: true,
        minAdvanceHours: true,
        freeCancelHours: true,
        status: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    // 格式化返回数据
    const formattedCoaches = coaches.map((coach: typeof coaches[number]) => ({
      ...coach,
      price: Number(coach.price),
      rating: Number(coach.rating),
      specialty: coach.specialty || [],
    }));

    return successWithPagination(formattedCoaches, page, pageSize, total);
  } catch (error) {
    console.error("获取教练列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 新增教练
 * 
 * POST /api/admin/coaches
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      avatar,
      title,
      introduction,
      specialty,
      certifications,
      experience,
      price,
      minAdvanceHours,
      freeCancelHours,
      status = "active",
      sortOrder = 0,
    } = body;

    // 参数校验
    if (!name) {
      return Errors.MISSING_PARAMS("name");
    }
    if (!price || price <= 0) {
      return Errors.INVALID_PARAMS("课时费必须大于0");
    }

    // 创建教练
    const coach = await prisma.coach.create({
      data: {
        name,
        avatar,
        title,
        introduction,
        specialty: specialty || [],
        certifications: certifications || [],
        experience: experience || 1,
        price,
        minAdvanceHours: minAdvanceHours ?? null,
        freeCancelHours: freeCancelHours ?? null,
        status,
        sortOrder,
      },
    });

    return success({
      id: coach.id,
      name: coach.name,
      message: "教练创建成功",
    });
  } catch (error) {
    console.error("创建教练失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
