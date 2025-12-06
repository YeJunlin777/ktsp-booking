import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { memberConfig } from "@/config";

/**
 * 管理后台 - 会员列表
 * 
 * GET /api/admin/members
 * Query:
 * - keyword: 搜索关键词（姓名/手机号）
 * - status: 状态筛选（active/disabled）
 * - verifyStatus: 实名状态
 * - page: 页码
 * - pageSize: 每页数量
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");
    const status = searchParams.get("status");
    const verifyStatus = searchParams.get("verifyStatus");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    // 构建查询条件
    const where: Record<string, unknown> = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { phone: { contains: keyword } },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    if (verifyStatus && verifyStatus !== "all") {
      where.verifyStatus = verifyStatus;
    }

    // 查询总数
    const total = await prisma.user.count({ where });

    // 查询会员列表
    const users = await prisma.user.findMany({
      where,
      orderBy: [
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        phone: true,
        avatar: true,
        memberLevel: true,
        points: true,
        verifyStatus: true,
        status: true,
        createdAt: true,
      },
    });

    // 根据等级名称获取等级信息
    const getLevelInfo = (levelName: string) => {
      const levelInfo = memberConfig.levels.find(l => l.name === levelName);
      return levelInfo || memberConfig.levels[0]; // 默认普通会员
    };

    // 格式化返回数据
    const formattedMembers = users.map((user) => {
      const levelInfo = getLevelInfo(user.memberLevel || "普通会员");
      return {
        id: user.id,
        name: user.name || "未设置",
        phone: user.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2") : "-",
        avatar: user.avatar,
        level: levelInfo.level,
        levelName: levelInfo.name,
        levelColor: levelInfo.color,
        points: user.points || 0,
        verifyStatus: user.verifyStatus || "未认证",
        status: user.status || "active",
        createdAt: user.createdAt.toISOString().split("T")[0],
      };
    });

    // 统计数据
    const stats = {
      total,
      premium: await prisma.user.count({ 
        where: { 
          memberLevel: { in: ["金卡会员", "钻石会员"] } 
        } 
      }),
      pending: await prisma.user.count({ where: { verifyStatus: "待审核" } }),
      frozen: await prisma.user.count({ where: { status: "disabled" } }),
    };

    return success({
      list: formattedMembers,
      stats,
    }, {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("获取会员列表失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
