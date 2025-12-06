"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Eye,
  Ban,
  Gift,
  Shield,
  RefreshCw,
} from "lucide-react";
import { memberConfig } from "@/config";

interface Member {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  level: number;
  levelName: string;
  levelColor: string;
  points: number;
  totalSpent: number;
  verifyStatus: string;
  status: string;
  createdAt: string;
}

interface Stats {
  total: number;
  premium: number;
  pending: number;
  frozen: number;
}

const { admin } = memberConfig;

/**
 * 会员管理页面
 * 
 * 【职责】展示会员列表和管理功能
 * 【配置化】文案从 memberConfig 读取
 */
export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, premium: 0, pending: 0, frozen: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");

  const fetchMembers = useCallback(async (keyword?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) params.set("keyword", keyword);
      
      const response = await fetch(`/api/admin/members?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setMembers(result.data.list || []);
        setStats(result.data.stats || { total: 0, premium: 0, pending: 0, frozen: 0 });
      }
    } catch (error) {
      console.error("获取会员列表失败:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSearch = () => {
    fetchMembers(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{admin.texts.pageTitle}</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="mr-2 h-4 w-4" />
            {admin.texts.verifyButton}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">{admin.texts.totalMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.premium}</div>
            <p className="text-sm text-muted-foreground">{admin.texts.premiumMembers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">{admin.texts.pendingVerify}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.frozen}</div>
            <p className="text-sm text-muted-foreground">{admin.texts.frozenMembers}</p>
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
                placeholder={admin.texts.searchPlaceholder}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">暂无会员数据</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">会员</th>
                    <th className="pb-3 font-medium">手机号</th>
                    <th className="pb-3 font-medium">等级</th>
                    <th className="pb-3 font-medium">积分</th>
                    <th className="pb-3 font-medium">实名</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">注册时间</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {members.map((member) => (
                    <tr key={member.id} className="text-sm">
                      <td className="py-4 font-medium">{member.name}</td>
                      <td className="py-4">{member.phone}</td>
                      <td className="py-4">
                        <span className="inline-flex rounded-full px-2 py-1 text-xs bg-gray-100 text-gray-700">
                          {member.levelName}
                        </span>
                      </td>
                      <td className="py-4">{member.points}</td>
                      <td className="py-4">
                        <span className={admin.verifyStatus[member.verifyStatus as keyof typeof admin.verifyStatus]?.color || "text-gray-400"}>
                          {admin.verifyStatus[member.verifyStatus as keyof typeof admin.verifyStatus]?.label || member.verifyStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            admin.status[member.status as keyof typeof admin.status]?.color || ""
                          }`}
                        >
                          {admin.status[member.status as keyof typeof admin.status]?.label || member.status}
                        </span>
                      </td>
                      <td className="py-4 text-muted-foreground">{member.createdAt}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="查看详情">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title={admin.texts.adjustPoints}>
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
