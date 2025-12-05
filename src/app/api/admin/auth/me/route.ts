import { cookies } from "next/headers";
import { success, Errors } from "@/lib/response";

/**
 * 获取当前管理员信息 API
 * 
 * GET /api/admin/auth/me
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return Errors.UNAUTHORIZED("未登录");
    }

    // 解析 token
    const payload = JSON.parse(Buffer.from(token, "base64").toString());

    // 检查是否过期
    if (payload.exp < Date.now()) {
      cookieStore.delete("admin_token");
      return Errors.UNAUTHORIZED("登录已过期");
    }

    return success({
      id: payload.id,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    });
  } catch {
    return Errors.UNAUTHORIZED("无效的登录状态");
  }
}
