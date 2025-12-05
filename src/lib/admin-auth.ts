import { cookies } from "next/headers";

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

/**
 * 获取当前管理员信息（服务端）
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(token, "base64").toString());

    // 检查是否过期
    if (payload.exp < Date.now()) {
      return null;
    }

    return {
      id: payload.id,
      username: payload.username,
      name: payload.name,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * 检查是否是超级管理员
 */
export function isSuperAdmin(admin: AdminUser | null): boolean {
  return admin?.role === "super_admin";
}
