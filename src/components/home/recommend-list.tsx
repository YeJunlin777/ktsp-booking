"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { homeConfig } from "@/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ImageIcon } from "lucide-react";

interface RecommendVenue {
  id: string;
  name: string;
  type: string;
  image?: string;
  price: number;
  status: string;
}

interface RecommendListProps {
  title?: string;
  venues: RecommendVenue[];
  className?: string;
  showViewAll?: boolean;
}

// 场地类型标签映射
const typeLabels: Record<string, string> = {
  driving_range: "打位",
  simulator: "模拟器",
  putting_green: "推杆果岭",
  vip_room: "VIP房",
};

// 状态标签映射
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  active: { label: "可预约", variant: "default" },
  maintenance: { label: "维护中", variant: "secondary" },
  disabled: { label: "已停用", variant: "destructive" },
};

/**
 * 推荐场地列表
 * 
 * 【职责】展示推荐的场地列表
 * 【配置化】标题和空状态文案从配置读取
 */
export function RecommendList({ 
  title = homeConfig.recommend.title,
  venues,
  className,
  showViewAll = true,
}: RecommendListProps) {
  if (!venues.length) {
    return (
      <div className={cn("py-8 text-center text-muted-foreground", className)}>
        {homeConfig.recommend.emptyText}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {showViewAll && (
          <Link 
            href="/venues" 
            className="text-sm text-primary flex items-center gap-1"
          >
            {homeConfig.texts.viewAll}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* 场地列表 */}
      <div className="grid grid-cols-2 gap-3">
        {venues.map((venue) => (
          <Link key={venue.id} href={`/venues/${venue.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
              {/* 图片 */}
              <div className="relative aspect-[4/3] bg-muted">
                {venue.image ? (
                  // 外部URL使用原生img，避免域名白名单限制
                  venue.image.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => {
                        // 图片加载失败时隐藏
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : (
                    <Image
                      src={venue.image}
                      alt={venue.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )
                ) : null}
                {/* 图片加载失败或无图片时显示占位 */}
                <div className={cn(
                  "w-full h-full flex flex-col items-center justify-center text-muted-foreground absolute inset-0",
                  venue.image && "hidden"
                )}>
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">暂无图片</span>
                </div>
                {/* 状态标签 */}
                <Badge 
                  variant={statusConfig[venue.status]?.variant || "default"}
                  className="absolute top-2 right-2"
                >
                  {statusConfig[venue.status]?.label || venue.status}
                </Badge>
              </div>

              <CardContent className="p-3">
                {/* 名称 */}
                <h3 className="font-medium truncate">{venue.name}</h3>
                
                {/* 类型和价格 */}
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {typeLabels[venue.type] || venue.type}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    ¥{venue.price}/时
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
