import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { courseConfig } from "@/config";

// 开发模式：跳过登录验证（生产环境自动关闭）
const DEV_SKIP_AUTH = process.env.NODE_ENV === "development";
const DEV_USER_ID = "dev_user_001";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 取消课程报名 API
 * 
 * POST /api/courses/[id]/enroll/cancel
 */
export async function POST(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const { id } = await params;

    // 查询用户的报名记录
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        courseId: id,
        status: { in: ["pending", "confirmed"] },
      },
      include: {
        course: {
          select: {
            startDate: true,
            name: true,
          },
        },
      },
    });

    if (!booking) {
      return Errors.NOT_FOUND("未找到报名记录");
    }

    // 检查是否可以取消（开课前 N 小时）
    const now = new Date();
    const startDate = booking.course?.startDate;
    
    if (startDate) {
      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      const freeCancelHours = courseConfig.rules.freeCancelHours;
      
      if (hoursUntilStart < freeCancelHours) {
        return Errors.INVALID_PARAMS(
          `距开课不足${freeCancelHours}小时，无法取消报名`
        );
      }
    }

    // 取消报名
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "cancelled",
        cancelReason: "用户取消报名",
      },
    });

    return success({
      message: courseConfig.texts.cancelSuccess,
    });
  } catch (error) {
    console.error("取消报名失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
