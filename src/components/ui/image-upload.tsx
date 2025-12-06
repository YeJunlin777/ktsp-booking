"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 图片上传组件
 * 
 * 支持点击上传、拖拽上传、预览、删除
 */
export function ImageUpload({
  value,
  onChange,
  disabled,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;

    // 检查文件类型
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("只支持 JPG、PNG、GIF、WebP 格式");
      return;
    }

    // 检查文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("文件大小不能超过 5MB");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onChange(result.data.url);
        toast.success("上传成功");
      } else {
        toast.error(result.error?.message || "上传失败");
      }
    } catch (error) {
      console.error("上传失败:", error);
      toast.error("上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // 重置 input 以便可以重复选择同一文件
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileChange}
        disabled={disabled || uploading}
        className="hidden"
        title="选择图片"
        aria-label="选择图片上传"
      />

      {value ? (
        // 已上传：显示预览
        <div className="relative aspect-video rounded-lg overflow-hidden border bg-muted">
          <Image
            src={value}
            alt="Preview"
            fill
            className="object-cover"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        // 未上传：显示上传区域
        <div
          className={`
            aspect-video rounded-lg border-2 border-dashed 
            flex flex-col items-center justify-center gap-2 cursor-pointer
            transition-colors
            ${dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
            ${disabled || uploading ? "opacity-50 cursor-not-allowed" : ""}
          `}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">上传中...</span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium">点击或拖拽上传</span>
                <p className="text-xs text-muted-foreground mt-1">
                  支持 JPG、PNG、GIF、WebP，最大 5MB
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
