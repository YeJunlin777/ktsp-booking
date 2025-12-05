"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bell, Calendar, Gift, UserPlus, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessageDetail, useMessageConfig } from "@/hooks/use-message";

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  Bell,
  Calendar,
  Gift,
  UserPlus,
  Settings,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 消息详情页面
 * 
 * 【职责】展示消息详情
 */
export default function MessageDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const config = useMessageConfig();
  
  const { loading, error, message } = useMessageDetail(id);

  // 获取类型配置
  const getTypeConfig = (type: string) => {
    const typeConfig = config.types.find((t) => t.key === type);
    const Icon = iconMap[typeConfig?.icon || "Bell"] || Bell;
    const colorClass = config.iconColors[type as keyof typeof config.iconColors] 
      || "bg-gray-100 text-gray-600";
    return { Icon, colorClass, label: typeConfig?.label || type };
  };

  // 格式化时间
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, "0");
    const minute = date.getMinutes().toString().padStart(2, "0");
    return `${year}年${month}月${day}日 ${hour}:${minute}`;
  };

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // 错误状态
  if (error || !message) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="py-20 text-center text-destructive">
          {error || "消息不存在"}
        </div>
      </div>
    );
  }

  const { Icon, colorClass, label } = getTypeConfig(message.type);

  return (
    <div className="min-h-screen pb-20">
      {/* 返回按钮 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">消息详情</h1>
        </div>
      </div>

      {/* 消息内容 */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* 类型和时间 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <Badge variant="secondary">{label}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatTime(message.createdAt)}
              </span>
            </div>

            {/* 标题 */}
            <h2 className="text-lg font-semibold">{message.title}</h2>

            {/* 内容 */}
            <div className="text-muted-foreground whitespace-pre-wrap">
              {message.content}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
