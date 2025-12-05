"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatsItem {
  label: string;
  value: number | string;
  href?: string;
}

interface StatsCardProps {
  items: StatsItem[];
  className?: string;
}

/**
 * 统计数据卡片组件
 * 
 * 【职责】展示用户统计数据
 */
export function StatsCard({ items, className }: StatsCardProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {items.map((item, index) => {
            const Content = (
              <div className="flex flex-col items-center py-2">
                <span className="text-xl font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground mt-1">{item.label}</span>
              </div>
            );

            if (item.href) {
              return (
                <Link 
                  key={index} 
                  href={item.href}
                  className="hover:bg-muted/50 rounded-lg transition-colors"
                >
                  {Content}
                </Link>
              );
            }

            return <div key={index}>{Content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
