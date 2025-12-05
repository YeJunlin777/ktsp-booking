"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarDays, 
  Users, 
  MapPin, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

/**
 * 管理后台首页 - 控制台
 */
export default function AdminDashboardPage() {
  // TODO: 从 API 获取真实数据
  const stats = {
    todayBookings: 12,
    totalMembers: 256,
    activeVenues: 8,
    todayRevenue: 3580,
  };

  const recentBookings = [
    { id: "1", user: "张三", venue: "打位 A01", time: "09:00-10:00", status: "confirmed" },
    { id: "2", user: "李四", venue: "模拟器 S01", time: "10:00-11:00", status: "pending" },
    { id: "3", user: "王五", venue: "打位 A02", time: "14:00-15:00", status: "completed" },
    { id: "4", user: "赵六", venue: "VIP房 V01", time: "15:00-17:00", status: "cancelled" },
  ];

  const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    pending: { label: "待确认", icon: Clock, color: "text-yellow-500" },
    confirmed: { label: "已确认", icon: CheckCircle, color: "text-blue-500" },
    completed: { label: "已完成", icon: CheckCircle, color: "text-green-500" },
    cancelled: { label: "已取消", icon: XCircle, color: "text-gray-400" },
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">控制台</h1>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日预约
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
            <p className="text-xs text-muted-foreground">较昨日 +2</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              会员总数
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">本月新增 23</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              营业场地
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeVenues}</div>
            <p className="text-xs text-muted-foreground">维护中 1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              今日营收
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.todayRevenue}</div>
            <p className="text-xs text-muted-foreground">较昨日 +12%</p>
          </CardContent>
        </Card>
      </div>

      {/* 今日预约列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            今日预约
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.map((booking) => {
              const status = statusConfig[booking.status];
              const StatusIcon = status.icon;
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{booking.user}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.venue} · {booking.time}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span className="text-sm">{status.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
