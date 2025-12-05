"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { homeConfig } from "@/config";

interface BannerItem {
  id: string;
  title?: string;
  image: string;
  link?: string;
}

interface BannerCarouselProps {
  banners: BannerItem[];
  className?: string;
}

/**
 * 首页轮播Banner
 * 
 * 【职责】展示轮播图
 * 【配置化】轮播参数从配置读取
 */
export function BannerCarousel({ banners, className }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { autoPlay, interval, showIndicator } = homeConfig.banner;

  // 自动轮播
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide, banners.length]);

  if (!banners.length) {
    return (
      <div className={cn("aspect-[2/1] bg-muted rounded-xl flex items-center justify-center", className)}>
        <span className="text-muted-foreground">暂无Banner</span>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* 轮播内容 */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner) => {
          const imageElement = (
            <div className="relative aspect-[2/1]">
              <Image
                src={banner.image}
                alt={banner.title || "Banner"}
                fill
                className="object-cover"
                priority
              />
            </div>
          );

          return (
            <div key={banner.id} className="w-full flex-shrink-0">
              {banner.link ? (
                <Link href={banner.link}>{imageElement}</Link>
              ) : (
                imageElement
              )}
            </div>
          );
        })}
      </div>

      {/* 指示器 */}
      {showIndicator && banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              )}
              aria-label={`切换到第${index + 1}张`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
