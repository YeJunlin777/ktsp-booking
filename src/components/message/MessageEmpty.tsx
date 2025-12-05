"use client";

import { cn } from "@/lib/utils";
import { Bell } from "lucide-react";
import { messageConfig } from "@/config";

interface MessageEmptyProps {
  className?: string;
}

/**
 * 消息空状态组件
 * 
 * 【职责】展示无消息状态
 * 【配置化】文字从配置读取
 */
export function MessageEmpty({ className }: MessageEmptyProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-20", className)}>
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <Bell className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{messageConfig.texts.emptyText}</p>
    </div>
  );
}
