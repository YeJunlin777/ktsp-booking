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
  Calendar,
  Star,
} from "lucide-react";

interface Coach {
  id: string;
  name: string;
  title: string;
  phone: string;
  rating: number;
  lessonCount: number;
  price: number;
  status: string;
}

/**
 * 教练管理页面
 * 
 * 开发者 B 负责
 */
export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      // TODO: 调用管理后台 API
      // 临时 mock 数据
      setCoaches([
        { id: "1", name: "王教练", title: "高级教练", phone: "138****8001", rating: 4.8, lessonCount: 500, price: 300, status: "active" },
        { id: "2", name: "李教练", title: "资深教练", phone: "138****8002", rating: 4.9, lessonCount: 300, price: 280, status: "active" },
        { id: "3", name: "张教练", title: "初级教练", phone: "138****8003", rating: 4.5, lessonCount: 100, price: 200, status: "leave" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "在职", color: "bg-green-100 text-green-700" },
    leave: { label: "休假", color: "bg-yellow-100 text-yellow-700" },
    inactive: { label: "离职", color: "bg-gray-100 text-gray-700" },
  };

  const filteredCoaches = coaches.filter((coach) =>
    coach.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">教练管理</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新增教练
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索教练姓名..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 教练列表 */}
      <Card>
        <CardHeader>
          <CardTitle>教练列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">教练</th>
                    <th className="pb-3 font-medium">职称</th>
                    <th className="pb-3 font-medium">联系方式</th>
                    <th className="pb-3 font-medium">评分</th>
                    <th className="pb-3 font-medium">课时数</th>
                    <th className="pb-3 font-medium">课时费</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCoaches.map((coach) => (
                    <tr key={coach.id} className="text-sm">
                      <td className="py-4 font-medium">{coach.name}</td>
                      <td className="py-4">{coach.title}</td>
                      <td className="py-4">{coach.phone}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{coach.rating}</span>
                        </div>
                      </td>
                      <td className="py-4">{coach.lessonCount}节</td>
                      <td className="py-4">¥{coach.price}/节</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusLabels[coach.status]?.color || ""
                          }`}
                        >
                          {statusLabels[coach.status]?.label || coach.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="排班表">
                            <Calendar className="h-4 w-4" />
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
