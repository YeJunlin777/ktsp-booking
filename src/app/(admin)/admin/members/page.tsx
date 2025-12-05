"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Eye,
  Ban,
  Gift,
  Shield,
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  phone: string;
  level: number;
  points: number;
  totalSpent: number;
  verifyStatus: string;
  status: string;
  createdAt: string;
}

/**
 * 会员管理页面
 * 
 * 开发者 B 负责
 */
export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // TODO: 调用管理后台 API
      // 临时 mock 数据
      setMembers([
        { id: "1", name: "张三", phone: "138****0001", level: 3, points: 5000, totalSpent: 15000, verifyStatus: "verified", status: "active", createdAt: "2024-01-15" },
        { id: "2", name: "李四", phone: "138****0002", level: 2, points: 2000, totalSpent: 8000, verifyStatus: "verified", status: "active", createdAt: "2024-03-20" },
        { id: "3", name: "王五", phone: "138****0003", level: 1, points: 500, totalSpent: 2000, verifyStatus: "pending", status: "active", createdAt: "2024-06-10" },
        { id: "4", name: "赵六", phone: "138****0004", level: 1, points: 100, totalSpent: 500, verifyStatus: "none", status: "frozen", createdAt: "2024-08-05" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const levelLabels: Record<number, { label: string; color: string }> = {
    1: { label: "普通会员", color: "bg-gray-100 text-gray-700" },
    2: { label: "银卡会员", color: "bg-slate-100 text-slate-700" },
    3: { label: "金卡会员", color: "bg-yellow-100 text-yellow-700" },
    4: { label: "黑卡会员", color: "bg-zinc-800 text-white" },
  };

  const verifyLabels: Record<string, { label: string; color: string }> = {
    verified: { label: "已认证", color: "text-green-600" },
    pending: { label: "待审核", color: "text-yellow-600" },
    none: { label: "未认证", color: "text-gray-400" },
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "正常", color: "bg-green-100 text-green-700" },
    frozen: { label: "已冻结", color: "bg-red-100 text-red-700" },
  };

  const filteredMembers = members.filter((member) =>
    member.name.includes(searchKeyword) || member.phone.includes(searchKeyword)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">会员管理</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            实名审核
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-sm text-muted-foreground">总会员数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {members.filter((m) => m.level >= 3).length}
            </div>
            <p className="text-sm text-muted-foreground">高级会员</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {members.filter((m) => m.verifyStatus === "pending").length}
            </div>
            <p className="text-sm text-muted-foreground">待审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {members.filter((m) => m.status === "frozen").length}
            </div>
            <p className="text-sm text-muted-foreground">已冻结</p>
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
                placeholder="搜索姓名或手机号..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">筛选</Button>
          </div>
        </CardContent>
      </Card>

      {/* 会员列表 */}
      <Card>
        <CardHeader>
          <CardTitle>会员列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">会员</th>
                    <th className="pb-3 font-medium">手机号</th>
                    <th className="pb-3 font-medium">等级</th>
                    <th className="pb-3 font-medium">积分</th>
                    <th className="pb-3 font-medium">累计消费</th>
                    <th className="pb-3 font-medium">实名</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">注册时间</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="text-sm">
                      <td className="py-4 font-medium">{member.name}</td>
                      <td className="py-4">{member.phone}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            levelLabels[member.level]?.color || ""
                          }`}
                        >
                          {levelLabels[member.level]?.label || `等级${member.level}`}
                        </span>
                      </td>
                      <td className="py-4">{member.points}</td>
                      <td className="py-4">¥{member.totalSpent}</td>
                      <td className="py-4">
                        <span className={verifyLabels[member.verifyStatus]?.color}>
                          {verifyLabels[member.verifyStatus]?.label}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusLabels[member.status]?.color || ""
                          }`}
                        >
                          {statusLabels[member.status]?.label}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{member.createdAt}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="查看详情">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="调整积分">
                            <Gift className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="冻结/解冻">
                            <Ban className="h-4 w-4 text-destructive" />
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
