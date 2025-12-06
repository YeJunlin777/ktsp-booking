"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { venueConfig } from "@/config";
import { ImageIcon } from "lucide-react";

interface VenueCardProps {
  id: string;
  name: string;
  type: string;
  image?: string | null;
  price: number;
  peakPrice?: number | null;
  status: string;
  description?: string | null;
  className?: string;
}

// 状态配置
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: venueConfig.texts.statusAvailable, variant: "default" },
  maintenance: { label: venueConfig.texts.statusMaintenance, variant: "secondary" },
  disabled: { label: "已停用", variant: "destructive" },
};

/**
 * 场地卡片组件
 * 
 * 【职责】展示单个场地信息
 * 【配置化】状态文字从配置读取
 */
export function VenueCard({
  id,
  name,
  type,
  image,
  price,
  peakPrice,
  status,
  // description 保留接口但卡片不显示
  className,
}: VenueCardProps) {
  // 获取场地类型配置
  const typeConfig = venueConfig.venueTypes.find((t) => t.key === type);
  const typeLabel = typeConfig?.label || type;

  return (
    <Link href={`/venues/${id}`}>
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
        {/* 图片区域 */}
        <div className="relative aspect-[4/3] bg-muted">
          {image ? (
            // 外部URL使用原生img，避免域名白名单限制
            image.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : (
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            )
          ) : null}
          {/* 图片加载失败或无图片时显示占位 */}
          <div className={cn(
            "w-full h-full flex flex-col items-center justify-center text-muted-foreground absolute inset-0",
            image && "hidden"
          )}>
            <ImageIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">暂无图片</span>
          </div>
          {/* 状态标签 */}
          <Badge 
            variant={statusConfig[status]?.variant || "default"}
            className="absolute top-2 right-2"
          >
            {statusConfig[status]?.label || status}
          </Badge>
        </div>

        <CardContent className="p-3 space-y-1">
          {/* 名称 */}
          <h3 className="font-medium truncate">{name}</h3>
          
          {/* 类型 */}
          <p className="text-xs text-muted-foreground">{typeLabel}</p>
          
          {/* 价格 */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-primary">
              ¥{price}
            </span>
            <span className="text-xs text-muted-foreground">
              /{venueConfig.priceDisplay.unit.replace("元/", "")}
            </span>
            {peakPrice && peakPrice > price && (
              <span className="text-xs text-muted-foreground line-through">
                ¥{peakPrice}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
