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
  Package,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  category: string;
  points: number;
  stock: number;
  exchanged: number;
  status: string;
}

/**
 * 积分商城管理页面
 * 
 * 开发者 B 负责
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // TODO: 调用管理后台 API
      // 临时 mock 数据
      setProducts([
        { id: "1", name: "高尔夫球（3只装）", category: "goods", points: 500, stock: 100, exchanged: 50, status: "active" },
        { id: "2", name: "30分钟免费打位券", category: "virtual", points: 300, stock: 50, exchanged: 30, status: "active" },
        { id: "3", name: "品牌手套", category: "goods", points: 1000, stock: 20, exchanged: 10, status: "active" },
        { id: "4", name: "私教课程优惠券", category: "virtual", points: 800, stock: 0, exchanged: 25, status: "soldout" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    goods: "实物商品",
    virtual: "虚拟商品",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "上架中", color: "bg-green-100 text-green-700" },
    soldout: { label: "已售罄", color: "bg-red-100 text-red-700" },
    inactive: { label: "已下架", color: "bg-gray-100 text-gray-700" },
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">积分商城</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            兑换订单
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增商品
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-sm text-muted-foreground">商品总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {products.filter((p) => p.status === "active").length}
            </div>
            <p className="text-sm text-muted-foreground">上架中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + p.exchanged, 0)}
            </div>
            <p className="text-sm text-muted-foreground">累计兑换</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock === 0).length}
            </div>
            <p className="text-sm text-muted-foreground">已售罄</p>
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
                placeholder="搜索商品名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 商品列表 */}
      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">商品名称</th>
                    <th className="pb-3 font-medium">分类</th>
                    <th className="pb-3 font-medium">所需积分</th>
                    <th className="pb-3 font-medium">库存</th>
                    <th className="pb-3 font-medium">已兑换</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="text-sm">
                      <td className="py-4 font-medium">{product.name}</td>
                      <td className="py-4">{categoryLabels[product.category] || product.category}</td>
                      <td className="py-4">{product.points} 积分</td>
                      <td className="py-4">{product.stock}</td>
                      <td className="py-4">{product.exchanged}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusLabels[product.status]?.color || ""
                          }`}
                        >
                          {statusLabels[product.status]?.label || product.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
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
