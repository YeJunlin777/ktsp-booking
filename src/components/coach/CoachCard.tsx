"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { coachConfig } from "@/config";

interface CoachCardProps {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  specialty: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  price: number;
  status: string;
  className?: string;
}

/**
 * 教练卡片组件
 * 
 * 【职责】展示单个教练信息
 * 【配置化】标签文字从配置读取
 */
export function CoachCard({
  id,
  name,
  avatar,
  title,
  specialty,
  experience,
  rating,
  reviewCount,
  price,
  status,
  className,
}: CoachCardProps) {
  const isAvailable = status === "active";

  return (
    <Link href={`/coaches/${id}`}>
      <Card className={cn(
        "overflow-hidden hover:shadow-md transition-shadow",
        !isAvailable && "opacity-60",
        className
      )}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* 头像 */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {avatar ? (
                <Image
                  src={avatar}
                  alt={name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground">
                  {name.charAt(0)}
                </div>
              )}
            </div>

            {/* 信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{name}</h3>
                {title && (
                  <Badge variant="secondary" className="text-xs">
                    {title}
                  </Badge>
                )}
              </div>

              {/* 评分 */}
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({reviewCount}条评价)
                </span>
              </div>

              {/* 擅长领域 */}
              <div className="flex flex-wrap gap-1 mt-2">
                {specialty.slice(0, 3).map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 价格 */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-primary">¥{price}</div>
              <div className="text-xs text-muted-foreground">/课时</div>
            </div>
          </div>

          {/* 经验 */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>{coachConfig.texts.labelExperience}：{experience}年</span>
            {!isAvailable && (
              <Badge variant="secondary">暂不可约</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
