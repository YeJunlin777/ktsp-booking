import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * 文件上传 API
 * 
 * POST /api/upload
 * 
 * 支持图片上传，存储到 public/uploads 目录
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "请选择文件" } },
        { status: 400 }
      );
    }

    // 检查文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: "只支持 JPG、PNG、GIF、WebP 格式" } },
        { status: 400 }
      );
    }

    // 检查文件大小（最大 5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "文件大小不能超过 5MB" } },
        { status: 400 }
      );
    }

    // 生成文件名
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // 返回文件 URL
    const url = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      data: {
        url,
        filename,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("文件上传失败:", error);
    return NextResponse.json(
      { success: false, error: { code: "UPLOAD_ERROR", message: "上传失败" } },
      { status: 500 }
    );
  }
}
