"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { memberConfig } from "@/config";

interface UserCardProps {
  name: string;
  phone?: string | null;
  avatar?: string | null;
  level: number;
  points: number;
  onEditClick?: () => void;
  className?: string;
}

/**
 * 用户信息卡片组件
 * 
 * 【职责】展示用户基本信息和会员等级
 * 【配置化】等级信息从配置读取
 */
export function UserCard({
  name,
  phone,
  avatar,
  level,
  points,
  onEditClick,
  className,
}: UserCardProps) {
  // 获取等级配置
  const levelConfig = memberConfig.levels.find((l) => l.level === level) 
    || memberConfig.levels[0];
  
  // 计算下一等级所需积分
  const nextLevel = memberConfig.levels.find((l) => l.level === level + 1);
  const progressToNext = nextLevel 
    ? Math.min(100, (points / nextLevel.minPoints) * 100) 
    : 100;

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* 背景渐变 */}
      <div 
        className="h-24 bg-gradient-to-r from-primary to-primary/70"
        style={{ background: `linear-gradient(135deg, ${levelConfig.color}, ${levelConfig.color}88)` }}
      />
      
      <CardContent className="relative pt-0 pb-4 -mt-12">
        <div className="flex items-end gap-4">
          {/* 头像 */}
          <div className="relative w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-muted">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground">
                {name.charAt(0)}
              </div>
            )}
          </div>

          {/* 用户信息 */}
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{name}</h2>
              <Badge 
                style={{ backgroundColor: levelConfig.color, color: "#fff" }}
              >
                {levelConfig.name}
              </Badge>
            </div>
            {phone && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
              </p>
            )}
          </div>

          {/* 编辑按钮 */}
          {onEditClick && (
            <button 
              onClick={onEditClick}
              className="flex items-center text-sm text-muted-foreground hover:text-foreground"
            >
              {memberConfig.texts.editProfile}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 积分和等级进度 */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>积分: <strong className="text-primary">{points}</strong></span>
            {nextLevel && (
              <span className="text-muted-foreground">
                距{nextLevel.name}还需 {nextLevel.minPoints - points} 积分
              </span>
            )}
          </div>
          {nextLevel && (
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all"
                style={{ 
                  width: `${progressToNext}%`,
                  backgroundColor: levelConfig.color,
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
