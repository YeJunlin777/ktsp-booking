"use client";

import { useState, useEffect, useCallback } from "react";
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
  Loader2,
  RefreshCw,
} from "lucide-react";
import { get, del } from "@/lib/api";
import { toast } from "sonner";
import { CoachFormDialog, CoachScheduleDialog } from "@/components/admin/coach";

interface Coach {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  introduction?: string;
  specialty: string[];
  certifications?: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  lessonCount: number;
  price: number;
  status: string;
  sortOrder: number;
  createdAt: string;
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
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // 弹窗状态
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const fetchCoaches = useCallback(async (keyword?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (keyword) {
        params.set("keyword", keyword);
      }
      const result = await get<Coach[]>(`/api/admin/coaches?${params}`);
      setCoaches(result || []);
    } catch (error) {
      console.error("获取教练列表失败:", error);
      toast.error("获取教练列表失败");
    } finally {
      setLoading(false);
    }
  }, []);

  // 只在初始化时加载
  useEffect(() => {
    fetchCoaches();
  }, [fetchCoaches]);

  // 搜索处理（回车或点击搜索时）
  const handleSearch = () => {
    fetchCoaches(searchKeyword);
  };

  const handleDelete = async (coach: Coach) => {
    if (!confirm(`确定要删除教练「${coach.name}」吗？`)) {
      return;
    }
    
    try {
      setDeleting(coach.id);
      await del(`/api/admin/coaches/${coach.id}`);
      toast.success("教练已删除");
      fetchCoaches();
    } catch (error) {
      console.error("删除教练失败:", error);
      toast.error("删除失败，该教练可能有关联预约");
    } finally {
      setDeleting(null);
    }
  };

  // 打开新增弹窗
  const handleAdd = () => {
    setSelectedCoach(null);
    setFormDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleEdit = (coach: Coach) => {
    setSelectedCoach(coach);
    setFormDialogOpen(true);
  };

  // 打开排班弹窗
  const handleSchedule = (coach: Coach) => {
    setSelectedCoach(coach);
    setScheduleDialogOpen(true);
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: "在职", color: "bg-green-100 text-green-700" },
    leave: { label: "休假", color: "bg-yellow-100 text-yellow-700" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">教练管理</h1>
        <Button onClick={handleAdd}>
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
                placeholder="搜索教练姓名，按回车搜索..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              搜索
            </Button>
            <Button variant="outline" onClick={() => fetchCoaches()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 教练列表 */}
      <Card>
        <CardHeader>
          <CardTitle>教练列表（{coaches.length}人）</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">加载中...</span>
            </div>
          ) : coaches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂无教练数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">教练</th>
                    <th className="pb-3 font-medium">职称</th>
                    <th className="pb-3 font-medium">教龄</th>
                    <th className="pb-3 font-medium">评分</th>
                    <th className="pb-3 font-medium">课时数</th>
                    <th className="pb-3 font-medium">课时费</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {coaches.map((coach) => (
                    <tr key={coach.id} className="text-sm">
                      <td className="py-4 font-medium">{coach.name}</td>
                      <td className="py-4">{coach.title || "-"}</td>
                      <td className="py-4">{coach.experience}年</td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{coach.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({coach.reviewCount})
                          </span>
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
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="排班表"
                            onClick={() => handleSchedule(coach)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="编辑"
                            onClick={() => handleEdit(coach)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="删除"
                            onClick={() => handleDelete(coach)}
                            disabled={deleting === coach.id}
                          >
                            {deleting === coach.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
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

      {/* 新增/编辑弹窗 */}
      <CoachFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        coach={selectedCoach}
        onSuccess={fetchCoaches}
      />

      {/* 排班管理弹窗 */}
      <CoachScheduleDialog
        open={scheduleDialogOpen}
        onOpenChange={setScheduleDialogOpen}
        coach={selectedCoach}
      />
    </div>
  );
}
