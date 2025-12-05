"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
} from "lucide-react";

interface Booking {
  id: string;
  orderNo: string;
  userName: string;
  venueName: string;
  date: string;
  time: string;
  status: string;
  price: number;
}

/**
 * 预约管理页面
 * 
 * 开发者 A 负责
 */
export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // TODO: 调用管理后台 API
      // 临时 mock 数据
      setBookings([
        { id: "1", orderNo: "BK20241205001", userName: "张三", venueName: "打位 A01", date: "2024-12-05", time: "09:00-10:00", status: "pending", price: 100 },
        { id: "2", orderNo: "BK20241205002", userName: "李四", venueName: "模拟器 S01", date: "2024-12-05", time: "10:00-11:00", status: "confirmed", price: 200 },
        { id: "3", orderNo: "BK20241205003", userName: "王五", venueName: "打位 A02", date: "2024-12-05", time: "14:00-15:00", status: "completed", price: 100 },
        { id: "4", orderNo: "BK20241205004", userName: "赵六", venueName: "VIP房 V01", date: "2024-12-05", time: "15:00-17:00", status: "cancelled", price: 1000 },
        { id: "5", orderNo: "BK20241205005", userName: "钱七", venueName: "打位 A03", date: "2024-12-05", time: "16:00-17:00", status: "no_show", price: 100 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "待确认", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "已确认", color: "bg-blue-100 text-blue-700" },
    completed: { label: "已完成", color: "bg-green-100 text-green-700" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-700" },
    no_show: { label: "失约", color: "bg-red-100 text-red-700" },
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchSearch = 
      booking.userName.includes(searchKeyword) ||
      booking.orderNo.includes(searchKeyword);
    const matchStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:border-primary" onClick={() => setStatusFilter("pending")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">待确认</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setStatusFilter("confirmed")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "confirmed").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">已确认</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setStatusFilter("completed")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "completed").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">已完成</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary" onClick={() => setStatusFilter("no_show")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {bookings.filter((b) => b.status === "no_show").length}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">失约</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索订单号或用户名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              全部
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
                    <th className="pb-3 font-medium">场地</th>
                    <th className="pb-3 font-medium">日期</th>
                    <th className="pb-3 font-medium">时间</th>
                    <th className="pb-3 font-medium">金额</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="text-sm">
                      <td className="py-4 font-mono text-xs">{booking.orderNo}</td>
                      <td className="py-4">{booking.userName}</td>
                      <td className="py-4">{booking.venueName}</td>
                      <td className="py-4">{booking.date}</td>
                      <td className="py-4">{booking.time}</td>
                      <td className="py-4">¥{booking.price}</td>
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
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === "pending" && (
                            <Button variant="ghost" size="sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                          )}
                          {booking.status === "confirmed" && (
                            <Button variant="ghost" size="sm">
                              <XCircle className="h-4 w-4 text-red-500" />
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
