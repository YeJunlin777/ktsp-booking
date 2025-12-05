import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { getCurrentUserId } from "@/lib/session";
import { feedbackConfig } from "@/config/modules/feedback.config";

/**
 * 意见反馈 API
 * 
 * 【配置化】规则从 feedbackConfig 读取
 */

// POST /api/feedback - 提交反馈
export async function POST(request: NextRequest) {
  try {
    // 1. 验证登录
    const userId = await getCurrentUserId();
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    // 2. 解析请求体
    const body = await request.json();
    const { type, content, images } = body;

    // 3. 验证反馈类型
    const validTypes = feedbackConfig.types.map((t) => t.key);
    if (!type || !validTypes.includes(type)) {
      return Errors.INVALID_PARAMS("请选择反馈类型");
    }

    // 4. 验证内容长度
    const { contentMinLength, contentMaxLength } = feedbackConfig.rules;
    if (!content || content.length < contentMinLength) {
      return Errors.INVALID_PARAMS(`反馈内容至少${contentMinLength}个字`);
    }
    if (content.length > contentMaxLength) {
      return Errors.INVALID_PARAMS(`反馈内容最多${contentMaxLength}个字`);
    }

    // 5. 验证图片数量
    if (images && images.length > feedbackConfig.rules.maxImages) {
      return Errors.INVALID_PARAMS(`最多上传${feedbackConfig.rules.maxImages}张图片`);
    }

    // 6. 创建反馈
    const feedback = await prisma.feedback.create({
      data: {
        userId,
        type,
        content,
        images: images || [],
        status: "pending",
      },
    });

    return success({
      id: feedback.id,
      message: feedbackConfig.texts.submitSuccess,
    });
  } catch (error) {
    console.error("提交反馈失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}

// GET /api/feedback - 获取我的反馈列表
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return Errors.UNAUTHORIZED();
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        content: true,
        images: true,
        status: true,
        reply: true,
        createdAt: true,
      },
    });

    return success(feedbacks);
  } catch (error) {
    console.error("获取反馈列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
