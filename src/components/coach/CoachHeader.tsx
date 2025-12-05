"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Clock } from "lucide-react";
import { coachConfig } from "@/config";

interface CoachHeaderProps {
  name: string;
  avatar?: string | null;
  title?: string | null;
  bio?: string | null;
  specialty: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  price: number;
  certifications?: string[];
  className?: string;
}

/**
 * 教练详情头部组件
 * 
 * 【职责】展示教练详细信息
 * 【配置化】标签文字从配置读取
 */
export function CoachHeader({
  name,
  avatar,
  title,
  bio,
  specialty,
  experience,
  rating,
  reviewCount,
  price,
  certifications,
  className,
}: CoachHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* 基本信息 */}
      <div className="flex gap-4">
        {/* 头像 */}
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-muted-foreground">
              {name.charAt(0)}
            </div>
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{name}</h1>
            {title && (
              <Badge variant="secondary">{title}</Badge>
            )}
          </div>

          {/* 评分 */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {reviewCount}条评价
            </span>
          </div>

          {/* 经验 */}
          <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{experience}年教学经验</span>
          </div>
        </div>

        {/* 价格 */}
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-primary">¥{price}</div>
          <div className="text-xs text-muted-foreground">/课时</div>
        </div>
      </div>

      {/* 简介 */}
      {bio && (
        <p className="text-sm text-muted-foreground">{bio}</p>
      )}

      {/* 擅长领域 */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{coachConfig.texts.labelSpecialty}</h3>
        <div className="flex flex-wrap gap-2">
          {specialty.map((item, index) => (
            <Badge key={index} variant="outline">{item}</Badge>
          ))}
        </div>
      </div>

      {/* 资质证书 */}
      {certifications && certifications.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-1">
            <Award className="w-4 h-4" />
            资质认证
          </h3>
          <div className="flex flex-wrap gap-2">
            {certifications.map((cert, index) => (
              <Badge key={index} variant="secondary">{cert}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
