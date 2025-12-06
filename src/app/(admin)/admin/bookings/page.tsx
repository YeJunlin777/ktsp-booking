"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  List,
} from "lucide-react";
import { bookingConfig } from "@/config";
import { useAdminBookingList, useAdminBookingAction } from "@/hooks/use-admin-booking";

/**
 * 预约管理页面
 * 
 * 【职责】只负责布局和组合组件
 * 【Hook】业务逻辑封装在 useAdminBookingList 和 useAdminBookingAction
 */
export default function AdminBookingsPage() {
  // 使用 Hook 获取数据和操作
  const {
    loading,
    bookings,
    stats,
    filters,
    setKeyword,
    setStatus,
    setType,
    refresh,
  } = useAdminBookingList();

  const { confirmArrival, completeBooking, markNoShow, cancelBooking } = useAdminBookingAction(refresh);

  // 本地 UI 状态
  const [searchInput, setSearchInput] = useState("");

  // 配置
  const { admin } = bookingConfig;
  const statusConfig = admin.statusConfig as Record<string, { label: string; color: string }>;

  // 搜索处理
  const handleSearch = () => {
    setKeyword(searchInput);
  };

  // 获取预约类型标签
  const getTypeLabel = (type: string) => {
    const found = admin.bookingTypes.find(t => t.key === type);
    return found?.label || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">预约管理</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          手动预约
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${filters.status === "all" ? "border-primary bg-primary/5" : ""}`} 
          onClick={() => setStatus("all")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <List className="h-5 w-5 text-gray-500" />
              <span className="text-2xl font-bold">
                {stats.total}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">全部</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${filters.status === "pending" ? "border-primary bg-primary/5" : ""}`} 
          onClick={() => setStatus("pending")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {stats.pending}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">待确认</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${filters.status === "confirmed" ? "border-primary bg-primary/5" : ""}`} 
          onClick={() => setStatus("confirmed")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {stats.confirmed}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">已确认</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${filters.status === "completed" ? "border-primary bg-primary/5" : ""}`} 
          onClick={() => setStatus("completed")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {stats.completed}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer hover:border-primary transition-colors ${filters.status === "no_show" ? "border-primary bg-primary/5" : ""}`} 
          onClick={() => setStatus("no_show")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {stats.no_show}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">失约</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索订单号/用户名/手机号..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={filters.type}
              onChange={(e) => setType(e.target.value)}
              title="选择预约类型"
              aria-label="预约类型筛选"
            >
              {admin.bookingTypes.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
            <select
              className="rounded-md border px-3 py-2 text-sm"
              value={filters.status}
              onChange={(e) => setStatus(e.target.value)}
              title="选择预约状态"
              aria-label="预约状态筛选"
            >
              {admin.statusFilter.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
            <Button variant="outline" onClick={handleSearch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 预约列表 */}
      <Card>
        <CardHeader>
          <CardTitle>预约列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">订单号</th>
                    <th className="pb-3 font-medium">用户</th>
                    <th className="pb-3 font-medium">预约项目</th>
                    <th className="pb-3 font-medium">日期</th>
                    <th className="pb-3 font-medium">时间</th>
                    <th className="pb-3 font-medium">金额</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="text-sm">
                      <td className="py-4 font-mono text-xs">{booking.orderNo}</td>
                      <td className="py-4">
                        <div>{booking.userName}</div>
                        <div className="text-xs text-muted-foreground">{booking.userPhone}</div>
                      </td>
                      <td className="py-4">
                        <div>{booking.targetName}</div>
                        <div className="text-xs text-muted-foreground">{getTypeLabel(booking.type)}</div>
                      </td>
                      <td className="py-4">{booking.date}</td>
                      <td className="py-4">{booking.startTime}-{booking.endTime}</td>
                      <td className="py-4">¥{booking.finalPrice}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusConfig[booking.status]?.color || ""
                          }`}
                        >
                          {statusConfig[booking.status]?.label || booking.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          {/* 待确认 -> 确认到店 */}
                          {booking.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => confirmArrival(booking.id)}
                              title={admin.texts.confirmAction}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              到店
                            </Button>
                          )}
                          {/* 待确认 -> 失约（用户没来） */}
                          {booking.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markNoShow(booking.id)}
                              title={admin.texts.noShowAction}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                          {/* 待确认 -> 取消 */}
                          {booking.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelBooking(booking.id)}
                              title={admin.texts.cancelAction}
                            >
                              <Clock className="h-4 w-4 text-gray-500" />
                            </Button>
                          )}
                          {/* 已确认 -> 完成（付款后点击） */}
                          {booking.status === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => completeBooking(booking.id)}
                              title={admin.texts.completeAction}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              已付款
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
