"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  productName: string;
  productImage: string;
  points: number;
  status: "pending" | "shipped" | "completed";
  createdAt: string;
}

const statusMap = {
  pending: { label: "待发货", color: "bg-yellow-500", icon: Package },
  shipped: { label: "已发货", color: "bg-blue-500", icon: Truck },
  completed: { label: "已完成", color: "bg-green-500", icon: CheckCircle },
};

/**
 * 兑换记录页面
 */
export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    // 模拟加载数据
    setTimeout(() => {
      setOrders([
        {
          id: "1",
          productName: "高尔夫球（3只装）",
          productImage: "https://placehold.co/100x100/png?text=Golf+Ball",
          points: 500,
          status: "completed",
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          productName: "运动毛巾",
          productImage: "https://placehold.co/100x100/png?text=Towel",
          points: 300,
          status: "shipped",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}月${d.getDate()}日`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">兑换记录</h1>
      </div>

      {/* 订单列表 */}
      <div className="p-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无兑换记录</p>
          </div>
        ) : (
          orders.map((order) => {
            const status = statusMap[order.status];
            const StatusIcon = status.icon;
            return (
              <Card key={order.id}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{order.productName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.points} 积分 · {formatDate(order.createdAt)}
                      </p>
                      <Badge className={`${status.color} mt-2`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
