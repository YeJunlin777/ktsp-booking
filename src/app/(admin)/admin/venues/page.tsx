"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2,
  MoreHorizontal,
  RefreshCw,
  Wrench,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { venueConfig } from "@/config";
import { ImageUpload } from "@/components/admin/common";

// ==================== 类型定义 ====================

interface Venue {
  id: string;
  name: string;
  type: string;
  typeLabel: string;
  description: string | null;
  images: string[];
  price: number;
  peakPrice: number | null;
  capacity: number;
  openTime: string;
  closeTime: string;
  minDuration: number;
  maxDuration: number;
  status: string;
  sortOrder: number;
  bookingCount: number;
  reviewCount: number;
}

interface VenueFormData {
  name: string;
  type: string;
  description: string;
  images: string[];
  price: string;
  peakPrice: string;
  capacity: string;
  openTime: string;
  closeTime: string;
  minDuration: string;
  maxDuration: string;
  sortOrder: string;
}

const initialFormData: VenueFormData = {
  name: "",
  type: "driving_range",
  description: "",
  images: [],
  price: "",
  peakPrice: "",
  capacity: "1",
  openTime: "06:00",
  closeTime: "22:00",
  minDuration: "15",    // 最小时长15分钟（需求文档：支持15/30/60分钟）
  maxDuration: "240",
  sortOrder: "0",
};

// ==================== 常量配置 ====================

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "营业中", color: "bg-green-100 text-green-700" },
  maintenance: { label: "维护中", color: "bg-yellow-100 text-yellow-700" },
  disabled: { label: "已关闭", color: "bg-gray-100 text-gray-700" },
};

/**
 * 场地管理页面
 * 
 * 开发者 A 负责
 */
export default function AdminVenuesPage() {
  // ==================== 状态 ====================
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // 弹窗状态
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [formData, setFormData] = useState<VenueFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  
  // 删除确认弹窗
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingVenue, setDeletingVenue] = useState<Venue | null>(null);

  // ==================== 数据获取 ====================
  
  const fetchVenues = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      
      const res = await fetch(`/api/admin/venues?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setVenues(data.data);
      } else {
        toast.error(data.error?.message || "获取场地列表失败");
      }
    } catch (error) {
      console.error("获取场地列表失败:", error);
      toast.error("获取场地列表失败");
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, typeFilter, statusFilter]);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  // ==================== 表单处理 ====================
  
  const openCreateDialog = () => {
    setEditingVenue(null);
    setFormData(initialFormData);
    setDialogOpen(true);
  };

  const openEditDialog = (venue: Venue) => {
    setEditingVenue(venue);
    setFormData({
      name: venue.name,
      type: venue.type,
      description: venue.description || "",
      images: venue.images || [],
      price: String(venue.price),
      peakPrice: venue.peakPrice ? String(venue.peakPrice) : "",
      capacity: String(venue.capacity),
      openTime: venue.openTime,
      closeTime: venue.closeTime,
      minDuration: String(venue.minDuration),
      maxDuration: String(venue.maxDuration),
      sortOrder: String(venue.sortOrder),
    });
    setDialogOpen(true);
  };

  const handleFormChange = (field: keyof VenueFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // 表单验证
    if (!formData.name.trim()) {
      toast.error("请填写场地名称");
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      toast.error("请填写有效的价格");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim() || null,
        images: formData.images,
        price: Number(formData.price),
        peakPrice: formData.peakPrice ? Number(formData.peakPrice) : null,
        capacity: Number(formData.capacity) || 1,
        openTime: formData.openTime,
        closeTime: formData.closeTime,
        minDuration: Number(formData.minDuration) || 30,
        maxDuration: Number(formData.maxDuration) || 240,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      const url = editingVenue 
        ? `/api/admin/venues/${editingVenue.id}`
        : "/api/admin/venues";
      
      const res = await fetch(url, {
        method: editingVenue ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editingVenue ? "场地更新成功" : "场地创建成功");
        setDialogOpen(false);
        fetchVenues();
      } else {
        toast.error(data.error?.message || "操作失败");
      }
    } catch (error) {
      console.error("提交失败:", error);
      toast.error("操作失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== 删除处理 ====================
  
  const openDeleteDialog = (venue: Venue) => {
    setDeletingVenue(venue);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingVenue) return;

    try {
      const res = await fetch(`/api/admin/venues/${deletingVenue.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("场地删除成功");
        setDeleteDialogOpen(false);
        setDeletingVenue(null);
        fetchVenues();
      } else {
        toast.error(data.error?.message || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
      toast.error("删除失败，请重试");
    }
  };

  // ==================== 状态修改 ====================
  
  const handleStatusChange = async (venue: Venue, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/venues/${venue.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.data?.message || "状态更新成功");
        fetchVenues();
      } else {
        toast.error(data.error?.message || "状态更新失败");
      }
    } catch (error) {
      console.error("状态更新失败:", error);
      toast.error("状态更新失败");
    }
  };

  // ==================== 渲染 ====================

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">场地管理</h1>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          新增场地
        </Button>
      </div>

      {/* 搜索筛选栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索场地名称..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="场地类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                {venueConfig.venueTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">营业中</SelectItem>
                <SelectItem value="maintenance">维护中</SelectItem>
                <SelectItem value="disabled">已关闭</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchVenues}>
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 场地列表 */}
      <Card>
        <CardHeader>
          <CardTitle>场地列表 ({venues.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : venues.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              暂无场地数据
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">场地名称</th>
                    <th className="pb-3 font-medium">类型</th>
                    <th className="pb-3 font-medium">价格</th>
                    <th className="pb-3 font-medium">营业时间</th>
                    <th className="pb-3 font-medium">预约数</th>
                    <th className="pb-3 font-medium">状态</th>
                    <th className="pb-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="text-sm">
                      <td className="py-4">
                        <div className="font-medium">{venue.name}</div>
                        {venue.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {venue.description}
                          </div>
                        )}
                      </td>
                      <td className="py-4">{venue.typeLabel}</td>
                      <td className="py-4">
                        <div>¥{venue.price}/小时</div>
                        {venue.peakPrice && (
                          <div className="text-xs text-orange-600">
                            高峰 ¥{venue.peakPrice}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        {venue.openTime} - {venue.closeTime}
                      </td>
                      <td className="py-4">{venue.bookingCount}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusConfig[venue.status]?.color || "bg-gray-100"
                          }`}
                        >
                          {statusConfig[venue.status]?.label || venue.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditDialog(venue)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {venue.status !== "active" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(venue, "active")}>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  设为营业中
                                </DropdownMenuItem>
                              )}
                              {venue.status !== "maintenance" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(venue, "maintenance")}>
                                  <Wrench className="mr-2 h-4 w-4 text-yellow-500" />
                                  设为维护中
                                </DropdownMenuItem>
                              )}
                              {venue.status !== "disabled" && (
                                <DropdownMenuItem onClick={() => handleStatusChange(venue, "disabled")}>
                                  <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                                  关闭场地
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openDeleteDialog(venue)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                删除场地
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVenue ? "编辑场地" : "新增场地"}
            </DialogTitle>
            <DialogDescription>
              {editingVenue ? "修改场地信息" : "填写场地基本信息"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">场地名称 *</Label>
                <Input
                  id="name"
                  placeholder="如：打位 A01"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">场地类型 *</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(v) => handleFormChange("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {venueConfig.venueTypes.map((type) => (
                      <SelectItem key={type.key} value={type.key}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">场地描述</Label>
              <Textarea
                id="description"
                placeholder="场地介绍、设施说明等"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                rows={2}
              />
            </div>

            {/* 场地图片 */}
            <div className="space-y-2">
              <Label>场地图片</Label>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => handleFormChange("images", urls)}
                maxCount={99}
                hint="建议上传场地实景图，第一张为封面"
              />
            </div>

            {/* 价格设置 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">基础价格 (元/小时) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="100"
                  value={formData.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="peakPrice">高峰价格 (元/小时)</Label>
                <Input
                  id="peakPrice"
                  type="number"
                  min="0"
                  placeholder="留空则使用基础价格"
                  value={formData.peakPrice}
                  onChange={(e) => handleFormChange("peakPrice", e.target.value)}
                />
              </div>
            </div>

            {/* 营业时间 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openTime">营业开始时间</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={formData.openTime}
                  onChange={(e) => handleFormChange("openTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="closeTime">营业结束时间</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={formData.closeTime}
                  onChange={(e) => handleFormChange("closeTime", e.target.value)}
                />
              </div>
            </div>

            {/* 预约时长限制 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minDuration">最小时长 (分钟)</Label>
                <Input
                  id="minDuration"
                  type="number"
                  min="15"
                  step="15"
                  value={formData.minDuration}
                  onChange={(e) => handleFormChange("minDuration", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDuration">最大时长 (分钟)</Label>
                <Input
                  id="maxDuration"
                  type="number"
                  min="30"
                  step="30"
                  value={formData.maxDuration}
                  onChange={(e) => handleFormChange("maxDuration", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">容纳人数</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleFormChange("capacity", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序 (数字越小越靠前)</Label>
              <Input
                id="sortOrder"
                type="number"
                min="0"
                value={formData.sortOrder}
                onChange={(e) => handleFormChange("sortOrder", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "提交中..." : (editingVenue ? "保存" : "创建")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认弹窗 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⚠️ 永久删除场地</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>确定要永久删除场地「{deletingVenue?.name}」吗？</p>
                <p className="text-destructive font-medium">此操作不可恢复，场地数据将被永久删除！</p>
                {deletingVenue && deletingVenue.bookingCount > 0 && (
                  <p className="text-orange-600">
                    ⚠️ 该场地有 {deletingVenue.bookingCount} 条预约记录，删除后预约记录也将被清除。
                  </p>
                )}
                <p className="text-muted-foreground text-sm">
                  提示：如果只是暂时不使用，建议使用「关闭场地」功能。
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              确认永久删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
