import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { reviewConfig } from "@/config";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;
const DEV_USER_ID = "dev_user_001";

/**
 * 提交评价 API
 * 
 * POST /api/reviews
 */
export async function POST(request: NextRequest) {
  try {
    let userId = await getCurrentUserId();
    
    if (!userId && DEV_SKIP_AUTH) {
      userId = DEV_USER_ID;
    }
    
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const body = await request.json();
    const { bookingId, venueId, coachId, venueRating, coachRating, venueComment, coachComment } = body;

    if (!bookingId) {
      return Errors.INVALID_PARAMS("缺少预约ID");
    }

    // 开发模式：直接返回成功
    if (DEV_SKIP_AUTH) {
      return success({
        reviewId: `mock_review_${Date.now()}`,
        message: reviewConfig.texts.submitSuccess,
        points: reviewConfig.rules.rewardPoints,
      });
    }

    // 检查预约是否存在且已完成
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { id: true, userId: true, status: true, venueId: true, coachId: true },
    });

    if (!booking) {
      return Errors.NOT_FOUND("预约不存在");
    }

    if (booking.userId !== userId) {
      return Errors.FORBIDDEN();
    }

    if (booking.status !== "completed") {
      return Errors.INVALID_PARAMS("只能评价已完成的预约");
    }

    // 检查是否已评价
    const existingReview = await prisma.review.findFirst({
      where: { bookingId, userId },
    });

    if (existingReview) {
      return Errors.INVALID_PARAMS(reviewConfig.texts.alreadyReviewed);
    }

    // 创建评价
    const review = await prisma.review.create({
      data: {
        userId,
        bookingId,
        venueId: venueId || booking.venueId,
        coachId: coachId || booking.coachId,
        venueRating,
        coachRating,
        venueComment,
        coachComment,
      },
    });

    // TODO: 发放积分奖励

    return success({
      reviewId: review.id,
      message: reviewConfig.texts.submitSuccess,
      points: reviewConfig.rules.rewardPoints,
    });
  } catch (error) {
    console.error("提交评价失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

/**
 * 获取评价列表 API
 * 
 * GET /api/reviews?venueId=xxx 或 ?coachId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venueId = searchParams.get("venueId");
    const coachId = searchParams.get("coachId");

    // 构建查询条件
    const where: Record<string, unknown> = {};
    if (venueId) where.venueId = venueId;
    if (coachId) where.coachId = coachId;

    // 开发模式：返回模拟数据
    if (DEV_SKIP_AUTH && !venueId && !coachId) {
      const mockReviews = [
        {
          id: "1",
          userName: "张三",
          userAvatar: null,
          venueRating: 5,
          venueComment: "环境优雅、设施齐全。场地非常干净，服务也很周到！",
          coachRating: null,
          coachComment: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          userName: "李四",
          userAvatar: null,
          venueRating: 4,
          venueComment: "位置方便，整体体验不错。",
          coachRating: 5,
          coachComment: "专业耐心、讲解清晰。教练很专业！",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      return success(mockReviews);
    }

    // 查询评价
    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { name: true, avatar: true },
        },
      },
    });

    // 格式化返回
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      userName: review.user?.name || "匿名用户",
      userAvatar: review.user?.avatar,
      venueRating: review.venueRating,
      venueComment: review.venueComment,
      coachRating: review.coachRating,
      coachComment: review.coachComment,
      createdAt: review.createdAt.toISOString(),
    }));

    return success(formattedReviews);
  } catch (error) {
    console.error("获取评价列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
