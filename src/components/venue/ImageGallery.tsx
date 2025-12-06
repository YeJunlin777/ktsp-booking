"use client";

import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, ChevronLeft, ChevronRight, ImageIcon, ZoomIn } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
}

/**
 * 图片画廊组件
 * 
 * 【职责】展示多张图片，支持轮播、滑动、点击放大
 * 【配置化】宽高比可配置
 */
export function ImageGallery({
  images,
  alt = "图片",
  className,
  aspectRatio = "16/9",
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 最小滑动距离
  const minSwipeDistance = 50;

  // 上一张
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // 下一张
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  // 触摸开始
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // 触摸移动
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // 触摸结束
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // 无图片
  if (!images || images.length === 0) {
    return (
      <div 
        className={cn(
          "relative bg-muted rounded-xl overflow-hidden flex flex-col items-center justify-center text-muted-foreground",
          className
        )}
        style={{ aspectRatio }}
      >
        <ImageIcon className="w-12 h-12 mb-2" />
        <span>暂无图片</span>
      </div>
    );
  }

  const aspectClass = {
    "16/9": "aspect-[16/9]",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
  }[aspectRatio];

  return (
    <>
      {/* 主画廊 */}
      <div 
        ref={containerRef}
        className={cn("relative overflow-hidden rounded-xl bg-muted", aspectClass, className)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* 图片轮播 */}
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((src, index) => (
            <div 
              key={index} 
              className="relative w-full h-full flex-shrink-0 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              {src.startsWith("http") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`${alt} ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
            </div>
          ))}
        </div>

        {/* 放大提示 */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
          aria-label="查看大图"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* 左右箭头 - 桌面端 */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors hidden md:block"
              aria-label="上一张"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors hidden md:block"
              aria-label="下一张"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 指示器 */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex
                    ? "bg-white w-5"
                    : "bg-white/50 hover:bg-white/70"
                )}
                aria-label={`切换到第${index + 1}张`}
              />
            ))}
          </div>
        )}

        {/* 图片计数 */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Lightbox 大图查看 */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          {/* 无障碍访问 - 视觉隐藏 */}
          <VisuallyHidden>
            <DialogTitle>图片预览</DialogTitle>
            <DialogDescription>查看 {alt} 图片，共 {images.length} 张</DialogDescription>
          </VisuallyHidden>
          
          <div 
            className="relative w-full h-[85vh] flex items-center justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 text-white p-2 rounded-full hover:bg-white/20 transition-colors"
              aria-label="关闭"
            >
              <X className="w-6 h-6" />
            </button>

            {/* 大图 */}
            {images[currentIndex]?.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[currentIndex]}
                alt={`${alt} ${currentIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* 左右箭头 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 text-white p-3 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="下一张"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* 缩略图导航 */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] pb-2">
                {images.map((src, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      index === currentIndex
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    {src.startsWith("http") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={`缩略图 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={`缩略图 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
