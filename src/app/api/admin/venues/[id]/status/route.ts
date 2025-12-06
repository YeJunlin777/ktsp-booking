import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getAdminUser } from "@/lib/admin-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 有效的场地状态
const VALID_STATUSES = ["active", "maintenance", "disabled"] as const;
type VenueStatus = typeof VALID_STATUSES[number];

const STATUS_LABELS: Record<VenueStatus, string> = {
  active: "营业中",
  maintenance: "维护中",
  disabled: "已关闭",
};

/**
 * 管理后台 - 修改场地状态 API
 * 
 * PUT /api/admin/venues/[id]/status
 * Body: {
 *   status: "active" | "maintenance" | "disabled"
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

    // 2. 检查场地是否存在
    const venue = await prisma.venue.findUnique({
      where: { id },
      select: { id: true, name: true, status: true },
    });

    if (!venue) {
      return Errors.NOT_FOUND("场地");
    }

    // 3. 解析请求体
    const body = await request.json();
    const { status } = body;

    // 4. 验证状态值
    if (!status || !VALID_STATUSES.includes(status)) {
      return Errors.INVALID_PARAMS(
        `无效的状态值，可选：${VALID_STATUSES.join(", ")}`
      );
    }

    // 5. 如果要关闭场地，检查是否有进行中的预约
    if (status === "disabled" || status === "maintenance") {
      const activeBookings = await prisma.booking.count({
        where: {
          venueId: id,
          status: { in: ["pending", "confirmed"] },
          bookingDate: { gte: new Date() },
        },
      });

      if (activeBookings > 0 && status === "disabled") {
        return Errors.INVALID_PARAMS(
          `该场地有 ${activeBookings} 个未完成的预约，建议设为"维护中"而非直接关闭`
        );
      }
    }

    // 6. 更新状态
    await prisma.venue.update({
      where: { id },
      data: { status },
    });

    return success({
      id,
      status,
      statusLabel: STATUS_LABELS[status as VenueStatus],
      message: `场地已设为"${STATUS_LABELS[status as VenueStatus]}"`,
    });
  } catch (error) {
    console.error("修改场地状态失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
