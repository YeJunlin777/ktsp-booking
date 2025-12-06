import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getAdminUser } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 管理后台 - 获取节假日详情 API
 * 
 * GET /api/admin/holidays/[id]
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

    // 2. 查询节假日
    const holiday = await prisma.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      return Errors.NOT_FOUND("节假日");
    }

    return success({
      id: holiday.id,
      date: holiday.date.toISOString().split("T")[0],
      name: holiday.name,
      type: holiday.type,
      createdAt: holiday.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("获取节假日详情失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 更新节假日 API
 * 
 * PUT /api/admin/holidays/[id]
 * Body: {
 *   name?: string,
 *   type?: "holiday" | "workday"
 * }
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

    // 2. 检查节假日是否存在
    const existingHoliday = await prisma.holiday.findUnique({
      where: { id },
    });

    if (!existingHoliday) {
      return Errors.NOT_FOUND("节假日");
    }

    // 3. 解析请求体
    const body = await request.json();
    const { name, type } = body;

    // 4. 构建更新数据
    const updateData: Record<string, unknown> = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return Errors.INVALID_PARAMS("节假日名称不能为空");
      }
      updateData.name = name.trim();
    }

    if (type !== undefined) {
      const validTypes = ["holiday", "workday"];
      if (!validTypes.includes(type)) {
        return Errors.INVALID_PARAMS(`无效的类型，可选：${validTypes.join(", ")}`);
      }
      updateData.type = type;
    }

    if (Object.keys(updateData).length === 0) {
      return Errors.INVALID_PARAMS("没有需要更新的数据");
    }

    // 5. 更新节假日
    const holiday = await prisma.holiday.update({
      where: { id },
      data: updateData,
    });

    return success({
      id: holiday.id,
      message: "节假日更新成功",
    });
  } catch (error) {
    console.error("更新节假日失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 删除节假日 API
 * 
 * DELETE /api/admin/holidays/[id]
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

    // 2. 检查节假日是否存在
    const holiday = await prisma.holiday.findUnique({
      where: { id },
    });

    if (!holiday) {
      return Errors.NOT_FOUND("节假日");
    }

    // 3. 删除节假日
    await prisma.holiday.delete({
      where: { id },
    });

    return success({
      id,
      message: "节假日删除成功",
    });
  } catch (error) {
    console.error("删除节假日失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
