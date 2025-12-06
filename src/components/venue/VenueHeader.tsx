"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { venueConfig } from "@/config";
import { Clock, Users } from "lucide-react";
import { ImageGallery } from "./ImageGallery";

interface VenueHeaderProps {
  name: string;
  type: string;
  images: string[];
  price: number;
  peakPrice?: number | null;
  description?: string | null;
  facilities?: string[];
  openTime?: string;
  closeTime?: string;
  capacity?: number;
  className?: string;
}

/**
 * 场地详情头部组件
 * 
 * 【职责】展示场地详细信息
 * 【配置化】类型名称从配置读取
 */
export function VenueHeader({
  name,
  type,
  images,
  price,
  peakPrice,
  description,
  facilities,
  openTime,
  closeTime,
  capacity,
  className,
}: VenueHeaderProps) {
  const typeConfig = venueConfig.venueTypes.find((t) => t.key === type);
  const typeLabel = typeConfig?.label || type;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 图片画廊 */}
      <ImageGallery 
        images={images} 
        alt={name}
        aspectRatio="16/9"
      />

      {/* 基本信息 */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{name}</h1>
            <Badge variant="secondary" className="mt-1">{typeLabel}</Badge>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">¥{price}</div>
            <div className="text-xs text-muted-foreground">
              /{venueConfig.priceDisplay.unit.replace("元/", "")}
            </div>
            {peakPrice && peakPrice > price && (
              <div className="text-xs text-orange-500">
                高峰 ¥{peakPrice}
              </div>
            )}
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* 详细信息 */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {openTime && closeTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{openTime} - {closeTime}</span>
            </div>
          )}
          {capacity && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>容纳 {capacity} 人</span>
            </div>
          )}
        </div>

        {/* 设施标签 */}
        {facilities && facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {facilities.map((facility, index) => (
              <Badge key={index} variant="outline">{facility}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
