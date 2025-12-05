import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 🔧 开发模式：跳过登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;

// 需要登录才能访问的路径
const protectedPaths = [
  "/profile",
  "/bookings",
  "/checkin",
  "/points",
  "/messages",
];

// 管理后台路径
const adminPaths = ["/admin"];

// 登录后不能访问的路径（如登录页）
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  // 开发模式跳过所有验证
  if (DEV_SKIP_AUTH) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  
  // 获取token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // 未登录访问受保护页面 -> 跳转登录
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 未登录访问管理后台 -> 跳转后台登录
  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // 已登录访问登录页 -> 跳转首页
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由
     * - 静态文件
     * - 图片
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};
