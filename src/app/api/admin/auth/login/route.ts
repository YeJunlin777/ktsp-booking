import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

/**
 * 管理员登录 API
 * 
 * POST /api/admin/auth/login
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return Errors.INVALID_PARAMS("请输入账号和密码");
    }

    // 查询管理员
    const admin = await prisma.admin.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        password: true,
        name: true,
        role: true,
        status: true,
      },
    });

    if (!admin) {
      return Errors.UNAUTHORIZED("账号或密码错误");
    }

    if (admin.status !== "active") {
      return Errors.FORBIDDEN("账号已被禁用");
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return Errors.UNAUTHORIZED("账号或密码错误");
    }

    // 生成简单的 session token（生产环境应使用 JWT）
    const token = Buffer.from(JSON.stringify({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      exp: Date.now() + 24 * 60 * 60 * 1000, // 24小时过期
    })).toString("base64");

    // 设置 cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24小时
      path: "/",
    });

    return success({
      id: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    });
  } catch (error) {
    console.error("管理员登录失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
