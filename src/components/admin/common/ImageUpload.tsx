"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, ImageIcon, Link, Plus } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  /** 已上传的图片URL列表 */
  value: string[];
  /** 图片变更回调 */
  onChange: (urls: string[]) => void;
  /** 最大图片数量 */
  maxCount?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 提示文字 */
  hint?: string;
  /** 是否显示URL输入框（用于云存储链接） */
  allowUrlInput?: boolean;
}

/**
 * 多图片上传组件
 * 
 * 【职责】处理多图片上传，支持本地上传和云存储URL输入
 * 【配置化】通过 props 配置最大数量、提示文字、是否允许URL输入
 * 
 * 支持两种模式：
 * 1. 本地上传 - 上传到服务器 /api/upload
 * 2. URL输入 - 直接输入云存储链接（如 OSS、COS、S3）
 */
export function ImageUpload({
  value = [],
  onChange,
  maxCount = 5,
  disabled = false,
  hint = "支持 JPG、PNG、GIF、WebP，最大 5MB",
  allowUrlInput = true,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 验证URL格式
  const isValidImageUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url);
      // 支持 http/https 协议
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return false;
      }
      // 检查常见图片扩展名或云存储域名
      const imageExtensions = /\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i;
      const cloudDomains = [
        "oss-cn-", "cos.", "s3.", "cloudinary", "imgur", 
        "unsplash", "pexels", "cdn", "storage"
      ];
      const hasImageExt = imageExtensions.test(parsed.pathname);
      const isCloudUrl = cloudDomains.some(d => parsed.hostname.includes(d));
      return hasImageExt || isCloudUrl || parsed.pathname.includes("/image");
    } catch {
      return false;
    }
  };

  // 添加URL
  const handleAddUrl = () => {
    const url = urlInputValue.trim();
    
    if (!url) {
      toast.error("请输入图片URL");
      return;
    }

    if (!isValidImageUrl(url)) {
      toast.error("请输入有效的图片URL");
      return;
    }

    if (value.includes(url)) {
      toast.error("该图片已存在");
      return;
    }

    if (value.length >= maxCount) {
      toast.error(`最多只能添加 ${maxCount} 张图片`);
      return;
    }

    onChange([...value, url]);
    setUrlInputValue("");
    setShowUrlInput(false);
    toast.success("图片添加成功");
  };

  // 上传图片
  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = maxCount - value.length;
    if (remainingSlots <= 0) {
      toast.error(`最多只能上传 ${maxCount} 张图片`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    setUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`${file.name} 格式不支持`);
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} 超过 5MB 限制`);
          continue;
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (result.success) {
          newUrls.push(result.data.url);
        } else {
          toast.error(result.error?.message || `${file.name} 上传失败`);
        }
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(`成功上传 ${newUrls.length} 张图片`);
      }
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("上传失败，请重试");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // 删除图片
  const handleRemove = (index: number) => {
    const newUrls = value.filter((_, i) => i !== index);
    onChange(newUrls);
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      handleUpload(e.dataTransfer.files);
    }
  };

  // 处理图片加载错误
  const handleImageError = (url: string) => {
    setImageError(prev => ({ ...prev, [url]: true }));
  };

  return (
    <div className="space-y-3">
      {/* 已上传的图片列表 */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, index) => (
            <div
              key={url}
              className="group relative h-24 w-24 overflow-hidden rounded-lg border bg-muted"
            >
              {imageError[url] ? (
                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span className="mt-1 text-[10px]">加载失败</span>
                </div>
              ) : url.startsWith("http") ? (
                // 外部URL使用原生img，避免域名白名单限制
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`图片 ${index + 1}`}
                  className="h-full w-full object-cover"
                  onError={() => handleImageError(url)}
                />
              ) : (
                // 本地图片使用Next.js Image优化
                <Image
                  src={url}
                  alt={`图片 ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(url)}
                />
              )}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1 py-0.5 text-center text-xs text-white">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL输入框 */}
      {showUrlInput && value.length < maxCount && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="输入图片URL，如: https://cdn.example.com/image.jpg"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUrl())}
            className="flex-1"
          />
          <Button type="button" size="sm" onClick={handleAddUrl}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            size="sm" 
            variant="ghost"
            onClick={() => { setShowUrlInput(false); setUrlInputValue(""); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 上传区域 */}
      {value.length < maxCount && !showUrlInput && (
        <div className="space-y-2">
          <div
            className={`
              relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors
              ${disabled ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:bg-muted/50"}
            `}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              multiple
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={disabled || uploading}
            />

            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">上传中...</p>
              </>
            ) : (
              <>
                <div className="rounded-full bg-muted p-3">
                  {value.length === 0 ? (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="mt-2 text-sm font-medium">
                  {value.length === 0 ? "点击或拖拽上传图片" : "继续添加图片"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {hint} {maxCount < 99 ? `(${value.length}/${maxCount})` : value.length > 0 ? `(已上传 ${value.length} 张)` : ""}
                </p>
              </>
            )}
          </div>

          {/* URL输入按钮 */}
          {allowUrlInput && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowUrlInput(true)}
              disabled={disabled}
            >
              <Link className="mr-2 h-4 w-4" />
              使用图片URL（云存储链接）
            </Button>
          )}
        </div>
      )}

      {/* 已达上限提示 */}
      {maxCount < 99 && value.length >= maxCount && (
        <p className="text-center text-sm text-muted-foreground">
          已达到最大图片数量 ({maxCount} 张)
        </p>
      )}
    </div>
  );
}
