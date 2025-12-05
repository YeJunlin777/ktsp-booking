"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, User } from "lucide-react";
import { courseConfig } from "@/config";

interface CourseCardProps {
  id: string;
  name: string;
  image?: string | null;
  category: string;
  level: string;
  coachName: string;
  startTime: string;
  duration: number;
  capacity: number;
  enrolled: number;
  price: number;
  status: string;
  className?: string;
}

/**
 * 课程卡片组件
 * 
 * 【职责】展示单个课程信息
 * 【配置化】状态标签从配置读取
 */
export function CourseCard({
  id,
  name,
  image,
  category,
  level,
  coachName,
  startTime,
  duration,
  capacity,
  enrolled,
  price,
  status,
  className,
}: CourseCardProps) {
  const statusConfig = courseConfig.status[status as keyof typeof courseConfig.status];
  const levelConfig = courseConfig.levels.find((l) => l.key === level);
  const categoryLabel = courseConfig.categories.find((c) => c.key === category)?.label || category;

  // 格式化日期时间
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    return `${month}月${day}日 ${hour}:${minute}`;
  };

  // 计算剩余名额
  const remaining = capacity - enrolled;

  return (
    <Link href={`/courses/${id}`}>
      <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
        {/* 封面图 */}
        <div className="relative aspect-video bg-muted">
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
          {/* 状态标签 */}
          <Badge className={cn("absolute top-2 right-2", statusConfig?.color)}>
            {statusConfig?.label || status}
          </Badge>
          {/* 分类标签 */}
          <Badge variant="secondary" className="absolute top-2 left-2">
            {categoryLabel}
          </Badge>
        </div>

        <CardContent className="p-3 space-y-2">
          {/* 课程名称 */}
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate flex-1">{name}</h3>
            {levelConfig && (
              <Badge className={levelConfig.color}>{levelConfig.label}</Badge>
            )}
          </div>

          {/* 教练 */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{coachName}</span>
          </div>

          {/* 时间 */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDateTime(startTime)}</span>
          </div>

          {/* 时长和人数 */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{duration}分钟</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{enrolled}/{capacity}人</span>
              {remaining <= 3 && remaining > 0 && (
                <span className="text-orange-500">仅剩{remaining}</span>
              )}
            </div>
          </div>

          {/* 价格 */}
          <div className="pt-2 border-t flex items-center justify-between">
            <span className="text-lg font-bold text-primary">¥{price}</span>
            {status === "enrolling" && remaining > 0 && (
              <span className="text-xs text-primary">可报名</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
