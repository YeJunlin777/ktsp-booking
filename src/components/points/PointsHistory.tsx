"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface PointsRecord {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  createdAt: string;
}

interface PointsHistoryProps {
  records: PointsRecord[];
  className?: string;
}

/**
 * 积分记录列表组件
 * 
 * 【职责】展示积分变动记录
 */
export function PointsHistory({ records, className }: PointsHistoryProps) {
  // 格式化日期
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours().toString().padStart(2, "0");
    const minute = d.getMinutes().toString().padStart(2, "0");
    return `${month}月${day}日 ${hour}:${minute}`;
  };

  if (records.length === 0) {
    return (
      <div className={cn("py-16 text-center text-muted-foreground", className)}>
        暂无积分记录
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardContent className="p-0 divide-y">
        {records.map((record) => (
          <div key={record.id} className="flex items-center gap-3 px-4 py-3">
            {/* 图标 */}
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              record.type === "earn" ? "bg-green-100" : "bg-red-100"
            )}>
              {record.type === "earn" ? (
                <ArrowUp className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-600" />
              )}
            </div>

            {/* 描述 */}
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{record.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}</p>
            </div>

            {/* 积分变动 */}
            <span className={cn(
              "font-semibold",
              record.type === "earn" ? "text-green-600" : "text-red-600"
            )}>
              {record.type === "earn" ? "+" : "-"}{record.amount}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
