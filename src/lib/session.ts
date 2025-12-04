import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./db";

// 获取当前登录用户Session
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

// 获取当前登录用户ID
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user?.id || null;
}

// 获取当前登录用户完整信息
export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      phone: true,
      email: true,
      name: true,
      nickname: true,
      avatar: true,
      memberLevel: true,
      points: true,
      realName: true,
      verifyStatus: true,
      inviteCode: true,
      status: true,
      createdAt: true,
    },
  });
}

// 检查用户是否登录，未登录抛出错误
export async function requireAuth() {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}
