"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, User, MapPin } from "lucide-react";
import { courseConfig } from "@/config";

interface CourseHeaderProps {
  name: string;
  image?: string | null;
  description?: string | null;
  category: string;
  level: string;
  coachName: string;
  startTime: string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  location?: string | null;
  status: string;
  className?: string;
}

/**
 * 课程详情头部组件
 * 
 * 【职责】展示课程详细信息
 * 【配置化】标签文字从配置读取
 */
export function CourseHeader({
  name,
  image,
  description,
  category,
  level,
  coachName,
  startTime,
  duration,
  capacity,
  enrolled,
  price,
  location,
  status,
  className,
}: CourseHeaderProps) {
  const statusConfig = courseConfig.status[status as keyof typeof courseConfig.status];
  const levelConfig = courseConfig.levels.find((l) => l.key === level);
  const categoryLabel = courseConfig.categories.find((c) => c.key === category)?.label || category;

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    return `${year}年${month}月${day}日 ${weekdays[d.getDay()]} ${hour}:${minute}`;
  };

  const remaining = capacity - enrolled;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 封面图 */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            暂无图片
          </div>
        )}
      </div>

      {/* 标签 */}
      <div className="flex flex-wrap gap-2">
        <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>
        <Badge variant="secondary">{categoryLabel}</Badge>
        {levelConfig && <Badge className={levelConfig.color}>{levelConfig.label}</Badge>}
      </div>

      {/* 课程名称 */}
      <h1 className="text-xl font-bold">{name}</h1>

      {/* 课程描述 */}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {/* 课程信息 */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{courseConfig.texts.labelCoach}:</span>
          <span className="font-medium">{coachName}</span>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{courseConfig.texts.labelTime}:</span>
          <span>{formatDateTime(startTime)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{courseConfig.texts.labelDuration}:</span>
          <span>{duration}分钟</span>
        </div>

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{courseConfig.texts.labelCapacity}:</span>
          <span>
            {enrolled}/{capacity}人
            {remaining > 0 && <span className="text-orange-500 ml-2">剩余{remaining}名额</span>}
          </span>
        </div>

        {location && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{courseConfig.texts.labelLocation}:</span>
            <span>{location}</span>
          </div>
        )}
      </div>

      {/* 价格 */}
      <div className="pt-4 border-t">
        <span className="text-muted-foreground text-sm">{courseConfig.texts.labelPrice}</span>
        <span className="ml-2 text-2xl font-bold text-primary">¥{price}</span>
      </div>
    </div>
  );
}
