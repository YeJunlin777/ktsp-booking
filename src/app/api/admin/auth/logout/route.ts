import { cookies } from "next/headers";
import { success } from "@/lib/response";

/**
 * 管理员登出 API
 * 
 * POST /api/admin/auth/logout
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  
  return success({ message: "已登出" });
}
