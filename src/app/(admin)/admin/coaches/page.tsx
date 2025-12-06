"use client";

import { useState } from "react";
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
import { useAdminCoachList } from "@/hooks/use-admin-coach";
import { CoachFormDialog, CoachScheduleDialog } from "@/components/admin/coach";
import { coachConfig } from "@/config";

const { admin } = coachConfig;
const { texts: adminTexts, texts: { tableHeaders, status: statusConfig } } = admin;

// 教练类型（从 Hook 导出类型）
interface Coach {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  introduction?: string | null;
  specialty: string[];
  certifications?: string[];
  experience: number;
  rating: number;
  reviewCount: number;
  lessonCount: number;
  price: number;
  minAdvanceHours?: number | null;
  freeCancelHours?: number | null;
  status: string;
  sortOrder: number;
  createdAt: string;
}

/**
 * 教练管理页面
 * 
 * 【职责】只负责布局和组合组件
 * 【Hook】业务逻辑封装在 useAdminCoachList
 */
export default function AdminCoachesPage() {
  // 使用 Hook 获取数据和操作
  const { loading, coaches, search, refresh, deleteCoach } = useAdminCoachList();
  
  // 本地 UI 状态
  const [searchKeyword, setSearchKeyword] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  // 搜索处理
  const handleSearch = () => {
    search(searchKeyword);
  };

  // 删除处理
  const handleDelete = async (coach: Coach) => {
    setDeleting(coach.id);
    await deleteCoach(coach.id, coach.name);
    setDeleting(null);
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

  const statusLabels = statusConfig as Record<string, { label: string; color: string }>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{adminTexts.pageTitle}</h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          {adminTexts.addButton}
        </Button>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={adminTexts.searchPlaceholder}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              {adminTexts.searchButton}
            </Button>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {adminTexts.refreshButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 教练列表 */}
      <Card>
        <CardHeader>
          <CardTitle>{adminTexts.listTitle}（{coaches.length}人）</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{adminTexts.loadingText}</span>
            </div>
          ) : coaches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {adminTexts.emptyText}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{tableHeaders.name}</th>
                    <th className="pb-3 font-medium">{tableHeaders.title}</th>
                    <th className="pb-3 font-medium">{tableHeaders.experience}</th>
                    <th className="pb-3 font-medium">{tableHeaders.rating}</th>
                    <th className="pb-3 font-medium">{tableHeaders.lessons}</th>
                    <th className="pb-3 font-medium">{tableHeaders.price}</th>
                    <th className="pb-3 font-medium">{tableHeaders.status}</th>
                    <th className="pb-3 font-medium">{tableHeaders.actions}</th>
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
        onSuccess={refresh}
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
