"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown,
  CalendarDays,
  Users,
  DollarSign,
  BarChart3,
} from "lucide-react";

/**
 * 数据统计页面
 * 
 * 开发者 A 负责
 */
export default function AdminStatsPage() {
  // TODO: 从 API 获取真实数据
  const stats = {
    revenue: {
      today: 3580,
      week: 25600,
      month: 98500,
      trend: 12,
    },
    bookings: {
      today: 12,
      week: 85,
      month: 320,
      trend: 8,
    },
    members: {
      total: 256,
      new: 23,
      active: 180,
      trend: 15,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">数据统计</h1>
        <div className="flex gap-2">
          <Button variant="outline">本周</Button>
          <Button variant="outline">本月</Button>
          <Button variant="outline">导出报表</Button>
        </div>
      </div>

      {/* 营收统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            营收统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">今日营收</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">¥{stats.revenue.today}</span>
                <span className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.revenue.trend}%
                </span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">本周营收</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">¥{stats.revenue.week.toLocaleString()}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">本月营收</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">¥{stats.revenue.month.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* 图表占位 */}
          <div className="mt-6 flex h-64 items-center justify-center rounded-lg border bg-muted/30">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12" />
              <p className="mt-2">营收趋势图</p>
              <p className="text-sm">TODO: 接入图表组件</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 预约统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            预约统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">今日预约</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.bookings.today}</span>
                <span className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.bookings.trend}%
                </span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">本周预约</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.bookings.week}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">本月预约</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.bookings.month}</span>
              </div>
            </div>
          </div>

          {/* 图表占位 */}
          <div className="mt-6 flex h-64 items-center justify-center rounded-lg border bg-muted/30">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="mx-auto h-12 w-12" />
              <p className="mt-2">预约趋势图</p>
              <p className="text-sm">TODO: 接入图表组件</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 会员统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            会员统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">会员总数</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats.members.total}</span>
                <span className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  +{stats.members.trend}%
                </span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">本月新增</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.members.new}</span>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">活跃会员</p>
              <div className="mt-2">
                <span className="text-3xl font-bold">{stats.members.active}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
