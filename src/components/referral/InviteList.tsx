"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { referralConfig } from "@/config";

interface InviteRecord {
  id: string;
  inviteeName: string;
  status: "pending" | "completed";
  points: number;
  createdAt: string;
}

interface InviteListProps {
  records: InviteRecord[];
  className?: string;
}

/**
 * 邀请记录列表组件
 * 
 * 【职责】展示邀请记录
 * 【配置化】状态文字从配置读取
 */
export function InviteList({ records, className }: InviteListProps) {
  const { texts } = referralConfig;

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    return `${month}月${day}日`;
  };

  // 获取名字首字
  const getInitial = (name: string) => name?.charAt(0) || "U";

  if (records.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-muted-foreground">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <p>{texts.emptyText}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{texts.recordTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback>{getInitial(record.inviteeName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{record.inviteeName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(record.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                {record.status === "completed" ? texts.completed : texts.pending}
              </Badge>
              {record.points > 0 && (
                <p className="text-sm text-primary mt-1">+{record.points} 积分</p>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
