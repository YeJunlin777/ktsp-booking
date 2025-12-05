"use client";

import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 响应式容器组件
 * 
 * 【策略】渐进增强
 * - 手机端：全宽
 * - 电脑端：居中 + 最大宽度
 */
export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div className={cn(
      // 手机端：全宽
      "w-full",
      // 电脑端：居中容器，最大宽度
      "md:max-w-2xl md:mx-auto",
      className
    )}>
      {children}
    </div>
  );
}
