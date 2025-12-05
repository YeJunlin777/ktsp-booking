import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// 🔧 开发模式：跳过用户端登录验证（上线前改为 false）
const DEV_SKIP_AUTH = true;

// 需要登录才能访问的路径（用户端）
const protectedPaths = [
  "/profile",
  "/bookings",
  "/checkin",
  "/points",
  "/messages",
];

// 登录后不能访问的路径（如登录页）
const authPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 添加 pathname 到 headers（供 layout 使用）
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  // ====== 管理后台验证 ======
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLoginPage = pathname === "/admin/login";
  
  if (isAdminPath && !isAdminLoginPage) {
    const adminToken = request.cookies.get("admin_token")?.value;
    
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    
    // 验证 token 是否有效
    try {
      const payload = JSON.parse(Buffer.from(adminToken, "base64").toString());
      if (payload.exp < Date.now()) {
        // token 过期
        const res = NextResponse.redirect(new URL("/admin/login", request.url));
        res.cookies.delete("admin_token");
        return res;
      }
    } catch {
      // token 无效
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("admin_token");
      return res;
    }
  }

  // 管理后台已登录访问登录页 -> 跳转控制台
  if (isAdminLoginPage) {
    const adminToken = request.cookies.get("admin_token")?.value;
    if (adminToken) {
      try {
        const payload = JSON.parse(Buffer.from(adminToken, "base64").toString());
        if (payload.exp > Date.now()) {
          return NextResponse.redirect(new URL("/admin", request.url));
        }
      } catch {
        // token 无效，继续显示登录页
      }
    }
  }

  // ====== 用户端验证 ======
  // 开发模式跳过用户端验证
  if (DEV_SKIP_AUTH) {
    return response;
  }

  // 获取用户端 token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // 未登录访问受保护页面 -> 跳转登录
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已登录访问登录页 -> 跳转首页
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
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
