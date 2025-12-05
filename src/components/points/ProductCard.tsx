"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pointsConfig } from "@/config";

interface ProductCardProps {
  id: string;
  name: string;
  image?: string | null;
  points: number;
  originalPoints?: number | null;
  stock: number;
  category: string;
  userPoints: number;
  onRedeem?: (id: string) => void;
  className?: string;
}

/**
 * 积分商品卡片组件
 * 
 * 【职责】展示单个积分商品
 * 【配置化】文字从配置读取
 */
export function ProductCard({
  id,
  name,
  image,
  points,
  originalPoints,
  stock,
  category,
  userPoints,
  onRedeem,
  className,
}: ProductCardProps) {
  const isSoldOut = stock <= 0;
  const canRedeem = !isSoldOut && userPoints >= points;

  // 获取分类标签
  const categoryLabel = pointsConfig.productCategories.find((c) => c.key === category)?.label || category;

  return (
    <Card className={cn("overflow-hidden", isSoldOut && "opacity-60", className)}>
      {/* 图片 */}
      <div className="relative aspect-square bg-muted">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            暂无图片
          </div>
        )}
        {/* 分类标签 */}
        <Badge className="absolute top-2 left-2" variant="secondary">
          {categoryLabel}
        </Badge>
        {/* 售罄标识 */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold">{pointsConfig.texts.soldOutText}</span>
          </div>
        )}
      </div>

      <CardContent className="p-3 space-y-2">
        {/* 名称 */}
        <h3 className="font-medium truncate">{name}</h3>

        {/* 积分价格 */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{points}</span>
          <span className="text-xs text-muted-foreground">{pointsConfig.texts.pointsUnit}</span>
          {originalPoints && originalPoints > points && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPoints}
            </span>
          )}
        </div>

        {/* 库存 */}
        {!isSoldOut && (
          <p className="text-xs text-muted-foreground">
            {pointsConfig.texts.stockText.replace("{stock}", String(stock))}
          </p>
        )}

        {/* 兑换按钮 */}
        <Button
          size="sm"
          className="w-full"
          disabled={!canRedeem}
          onClick={() => onRedeem?.(id)}
        >
          {isSoldOut 
            ? pointsConfig.texts.soldOutText 
            : userPoints < points 
              ? "积分不足" 
              : "立即兑换"
          }
        </Button>
      </CardContent>
    </Card>
  );
}
