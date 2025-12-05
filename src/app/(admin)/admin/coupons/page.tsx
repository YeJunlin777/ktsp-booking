"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2,
  Send,
} from "lucide-react";

interface Coupon {
  id: string;
  name: string;
  type: string;
  value: number;
  minAmount: number;
  total: number;
  used: number;
  expireAt: string;
  status: string;
}

/**
 * 优惠券管理页面
 * 
 * 开发者 B 负责
 */
export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      // TODO: 调用管理后台 API
      // 临时 mock 数据
      setCoupons([
        { id: "1", name: "新人专享券", type: "amount", value: 20, minAmount: 100, total: 1000, used: 500, expireAt: "2024-12-31", status: "active" },
        { id: "2", name: "周末8折券", type: "discount", value: 8, minAmount: 50, total: 500, used: 200, expireAt: "2024-12-31", status: "active" },
        { id: "3", name: "满200减50", type: "amount", value: 50, minAmount: 200, total: 200, used: 200, expireAt: "2024-11-30", status: "expired" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const typeLabels: Record<string, string> = {
    amount: "满减券",
    discount: "折扣券",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "进行中", color: "bg-green-100 text-green-700" },
    expired: { label: "已过期", color: "bg-gray-100 text-gray-700" },
    inactive: { label: "已停用", color: "bg-red-100 text-red-700" },
  };

  const filteredCoupons = coupons.filter((coupon) =>
    coupon.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">优惠券管理</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          创建优惠券
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{coupons.length}</div>
            <p className="text-sm text-muted-foreground">优惠券总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {coupons.filter((c) => c.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">进行中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + c.total, 0)}
            </div>
            <p className="text-sm text-muted-foreground">发放总量</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {coupons.reduce((sum, c) => sum + c.used, 0)}
            </div>
            <p className="text-sm text-muted-foreground">已使用</p>
          </CardContent>
        </Card>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索优惠券名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 优惠券列表 */}
      <Card>
        <CardHeader>
          <CardTitle>优惠券列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">优惠券名称</th>
                    <th className="pb-3 font-medium">类型</th>
                    <th className="pb-3 font-medium">面值</th>
                    <th className="pb-3 font-medium">使用门槛</th>
                    <th className="pb-3 font-medium">发放/使用</th>
                    <th className="pb-3 font-medium">有效期</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="text-sm">
                      <td className="py-4 font-medium">{coupon.name}</td>
                      <td className="py-4">{typeLabels[coupon.type] || coupon.type}</td>
                      <td className="py-4">
                        {coupon.type === "amount" ? `¥${coupon.value}` : `${coupon.value}折`}
                      </td>
                      <td className="py-4">满¥{coupon.minAmount}</td>
                      <td className="py-4">{coupon.used}/{coupon.total}</td>
                      <td className="py-4">{coupon.expireAt}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusLabels[coupon.status]?.color || ""
                          }`}
                        >
                          {statusLabels[coupon.status]?.label || coupon.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="发放">
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
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
