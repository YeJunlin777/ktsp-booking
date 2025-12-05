"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  id: string;
  userName: string;
  userAvatar?: string | null;
  venueRating?: number | null;
  coachRating?: number | null;
  venueComment?: string | null;
  coachComment?: string | null;
  createdAt: string;
  className?: string;
}

/**
 * 评价卡片组件
 * 
 * 【职责】展示单条评价
 */
export function ReviewCard({
  userName,
  userAvatar,
  venueRating,
  coachRating,
  venueComment,
  coachComment,
  createdAt,
  className,
}: ReviewCardProps) {
  // 格式化时间
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  };

  // 获取用户名首字
  const getInitial = (name: string) => {
    return name?.charAt(0) || "U";
  };

  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        {/* 用户信息 */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userAvatar || undefined} alt={userName} />
            <AvatarFallback>{getInitial(userName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">{formatDate(createdAt)}</p>
          </div>
        </div>

        {/* 场地评价 */}
        {venueRating && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">场地:</span>
              <StarRating value={venueRating} readonly size="sm" showLabel={false} />
            </div>
            {venueComment && (
              <p className="text-sm text-foreground">{venueComment}</p>
            )}
          </div>
        )}

        {/* 教练评价 */}
        {coachRating && (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">教练:</span>
              <StarRating value={coachRating} readonly size="sm" showLabel={false} />
            </div>
            {coachComment && (
              <p className="text-sm text-foreground">{coachComment}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
