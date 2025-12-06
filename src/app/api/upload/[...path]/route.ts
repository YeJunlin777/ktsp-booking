import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { Errors } from "@/lib/response";

/**
 * 删除上传的文件
 * 
 * DELETE /api/upload/uploads/xxx.jpg
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const filePath = pathSegments.join("/");

    // 安全检查：只允许删除 uploads 目录下的文件
    if (!filePath.startsWith("uploads/")) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "无权删除此文件" } },
        { status: 403 }
      );
    }

    // 构建完整路径
    const fullPath = path.join(process.cwd(), "public", filePath);

    // 删除文件
    await unlink(fullPath);

    return NextResponse.json({
      success: true,
      data: { message: "文件已删除" },
    });
  } catch (error) {
    // 文件不存在也算成功（幂等）
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({
        success: true,
        data: { message: "文件不存在或已删除" },
      });
    }

    console.error("删除文件失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
