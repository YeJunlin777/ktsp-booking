import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, successWithPagination, Errors } from "@/lib/response";
import { getAdminUser } from "@/lib/admin-auth";

// 节假日类型
const HOLIDAY_TYPES = ["holiday", "workday"] as const;
type HolidayType = typeof HOLIDAY_TYPES[number];

const TYPE_LABELS: Record<HolidayType, string> = {
  holiday: "节假日",
  workday: "调休上班",
};

/**
 * 管理后台 - 节假日列表 API
 * 
 * GET /api/admin/holidays
 * Query:
 *   - year: 年份（默认当前年）
 *   - month: 月份（可选）
 *   - type: 类型筛选
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
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
    const month = searchParams.get("month");
    const type = searchParams.get("type");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "50")));

    // 3. 构建日期范围
    let startDate: Date;
    let endDate: Date;

    if (month) {
      const m = parseInt(month);
      startDate = new Date(year, m - 1, 1);
      endDate = new Date(year, m, 0, 23, 59, 59);
    } else {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
    }

    // 4. 构建查询条件
    const where: Record<string, unknown> = {
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (type && HOLIDAY_TYPES.includes(type as HolidayType)) {
      where.type = type;
    }

    // 5. 查询总数
    const total = await prisma.holiday.count({ where });

    // 6. 查询列表
    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 7. 格式化返回数据
    const formattedHolidays = holidays.map((holiday) => ({
      id: holiday.id,
      date: holiday.date.toISOString().split("T")[0],
      name: holiday.name,
      type: holiday.type,
      typeLabel: TYPE_LABELS[holiday.type as HolidayType] || holiday.type,
      createdAt: holiday.createdAt.toISOString(),
    }));

    return successWithPagination(formattedHolidays, page, pageSize, total);
  } catch (error) {
    console.error("获取节假日列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 管理后台 - 新增节假日 API
 * 
 * POST /api/admin/holidays
 * Body: {
 *   date: string (YYYY-MM-DD),
 *   name: string,
 *   type?: "holiday" | "workday"
 * }
 * 
 * 或批量添加:
 * Body: {
 *   holidays: Array<{ date: string, name: string, type?: string }>
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

    // 处理批量添加
    if (body.holidays && Array.isArray(body.holidays)) {
      return await handleBatchCreate(body.holidays);
    }

    // 处理单个添加
    const { date, name, type = "holiday" } = body;

    // 3. 参数校验
    if (!date) {
      return Errors.MISSING_PARAMS("日期");
    }

    if (!name || !name.trim()) {
      return Errors.MISSING_PARAMS("节假日名称");
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return Errors.INVALID_PARAMS("日期格式错误，请使用 YYYY-MM-DD 格式");
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return Errors.INVALID_PARAMS("无效的日期");
    }

    // 验证类型
    if (!HOLIDAY_TYPES.includes(type as HolidayType)) {
      return Errors.INVALID_PARAMS(`无效的类型，可选：${HOLIDAY_TYPES.join(", ")}`);
    }

    // 4. 检查日期是否已存在
    const existingHoliday = await prisma.holiday.findUnique({
      where: { date: parsedDate },
    });

    if (existingHoliday) {
      return Errors.ALREADY_EXISTS(`该日期(${date})的节假日设置`);
    }

    // 5. 创建节假日
    const holiday = await prisma.holiday.create({
      data: {
        date: parsedDate,
        name: name.trim(),
        type,
      },
    });

    return success({
      id: holiday.id,
      message: "节假日添加成功",
    });
  } catch (error) {
    console.error("添加节假日失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 批量添加节假日
 */
async function handleBatchCreate(holidays: Array<{ date: string; name: string; type?: string }>) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const validHolidays: Array<{ date: Date; name: string; type: string }> = [];
  const errors: string[] = [];

  // 验证每条数据
  for (const item of holidays) {
    if (!item.date || !dateRegex.test(item.date)) {
      errors.push(`日期格式错误: ${item.date}`);
      continue;
    }

    if (!item.name?.trim()) {
      errors.push(`缺少名称: ${item.date}`);
      continue;
    }

    const parsedDate = new Date(item.date);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`无效日期: ${item.date}`);
      continue;
    }

    const type = item.type || "holiday";
    if (!HOLIDAY_TYPES.includes(type as HolidayType)) {
      errors.push(`无效类型: ${item.date} - ${type}`);
      continue;
    }

    validHolidays.push({
      date: parsedDate,
      name: item.name.trim(),
      type,
    });
  }

  if (validHolidays.length === 0) {
    return Errors.INVALID_PARAMS(`所有数据验证失败: ${errors.join("; ")}`);
  }

  // 批量创建（跳过已存在的）
  let createdCount = 0;
  let skippedCount = 0;

  for (const holiday of validHolidays) {
    try {
      await prisma.holiday.create({
        data: holiday,
      });
      createdCount++;
    } catch {
      // 日期已存在，跳过
      skippedCount++;
    }
  }

  return success({
    createdCount,
    skippedCount,
    errors: errors.length > 0 ? errors : undefined,
    message: `成功添加 ${createdCount} 条，跳过 ${skippedCount} 条重复数据`,
  });
}
