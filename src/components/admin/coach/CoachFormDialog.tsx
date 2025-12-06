"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, User } from "lucide-react";
import { post, put } from "@/lib/api";
import { toast } from "sonner";

interface Coach {
  id: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  introduction?: string | null;
  specialty: string[];
  certifications?: string[];
  experience: number;
  price: number;
  minAdvanceHours?: number | null;
  freeCancelHours?: number | null;
  status: string;
  sortOrder: number;
}

interface CoachFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach?: Coach | null;
  onSuccess: () => void;
}

/**
 * 教练新增/编辑弹窗
 * 
 * 【职责】处理教练信息的创建和编辑
 * 【配置化】表单字段可根据需求调整
 */
export function CoachFormDialog({
  open,
  onOpenChange,
  coach,
  onSuccess,
}: CoachFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    title: "",
    introduction: "",
    specialty: "",
    certifications: "",
    experience: 1,
    price: 200,
    minAdvanceHours: "",
    freeCancelHours: "",
    status: "active",
    sortOrder: 0,
  });

  const isEdit = !!coach;

  // 编辑时填充数据
  useEffect(() => {
    if (coach) {
      setFormData({
        name: coach.name || "",
        avatar: coach.avatar || "",
        title: coach.title || "",
        introduction: coach.introduction || "",
        specialty: Array.isArray(coach.specialty) ? coach.specialty.join("、") : "",
        certifications: Array.isArray(coach.certifications) ? coach.certifications.join("、") : "",
        experience: coach.experience || 1,
        price: coach.price || 200,
        minAdvanceHours: coach.minAdvanceHours != null ? String(coach.minAdvanceHours) : "",
        freeCancelHours: coach.freeCancelHours != null ? String(coach.freeCancelHours) : "",
        status: coach.status || "active",
        sortOrder: coach.sortOrder || 0,
      });
    } else {
      // 新增时重置表单
      setFormData({
        name: "",
        avatar: "",
        title: "",
        introduction: "",
        specialty: "",
        certifications: "",
        experience: 1,
        price: 200,
        minAdvanceHours: "",
        freeCancelHours: "",
        status: "active",
        sortOrder: 0,
      });
    }
  }, [coach, open]);

  // 删除旧头像文件
  const deleteOldAvatar = async (avatarUrl: string) => {
    // 只删除本地上传的文件（以 /uploads/ 开头）
    if (!avatarUrl || !avatarUrl.startsWith("/uploads/")) return;
    
    try {
      await fetch(`/api/upload${avatarUrl}`, { method: "DELETE" });
    } catch (error) {
      console.error("删除旧头像失败:", error);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        // 删除旧头像
        if (formData.avatar) {
          await deleteOldAvatar(formData.avatar);
        }
        setFormData({ ...formData, avatar: result.data.url });
        toast.success("头像上传成功");
      } else {
        toast.error(result.error?.message || "上传失败");
      }
    } catch (error) {
      console.error("上传头像失败:", error);
      toast.error("上传失败");
    } finally {
      setUploading(false);
      // 清空 input 以便重复上传同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("请输入教练姓名");
      return;
    }

    if (formData.price <= 0) {
      toast.error("课时费必须大于0");
      return;
    }

    try {
      setLoading(true);

      const data = {
        name: formData.name.trim(),
        avatar: formData.avatar.trim() || null,
        title: formData.title.trim() || null,
        introduction: formData.introduction.trim() || null,
        specialty: formData.specialty
          .split(/[、,，]/)
          .map((s) => s.trim())
          .filter(Boolean),
        certifications: formData.certifications
          .split(/[、,，]/)
          .map((s) => s.trim())
          .filter(Boolean),
        experience: formData.experience,
        price: formData.price,
        minAdvanceHours: formData.minAdvanceHours ? parseInt(formData.minAdvanceHours) : null,
        freeCancelHours: formData.freeCancelHours ? parseInt(formData.freeCancelHours) : null,
        status: formData.status,
        sortOrder: formData.sortOrder,
      };

      if (isEdit && coach) {
        await put(`/api/admin/coaches/${coach.id}`, data);
        toast.success("教练信息已更新");
      } else {
        await post("/api/admin/coaches", data);
        toast.success("教练创建成功");
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("保存教练失败:", error);
      toast.error(isEdit ? "更新失败" : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑教练" : "新增教练"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                姓名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入教练姓名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">职称</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="如：高级教练"
              />
            </div>
          </div>

          {/* 头像上传 */}
          <div className="space-y-2">
            <Label>头像</Label>
            <div className="flex items-center gap-4">
              {/* 头像预览 */}
              <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                {formData.avatar ? (
                  <Image
                    src={formData.avatar}
                    alt="教练头像"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* 上传按钮 */}
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      上传中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      上传头像
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  支持 JPG、PNG、GIF、WebP，最大 5MB
                </p>
              </div>
            </div>
          </div>

          {/* 简介 */}
          <div className="space-y-2">
            <Label htmlFor="introduction">简介</Label>
            <Textarea
              id="introduction"
              value={formData.introduction}
              onChange={(e) => setFormData({ ...formData, introduction: e.target.value })}
              placeholder="请输入教练简介"
              rows={3}
            />
          </div>

          {/* 擅长领域 */}
          <div className="space-y-2">
            <Label htmlFor="specialty">擅长领域</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              placeholder="多个用顿号分隔，如：长杆、推杆、沙坑"
            />
          </div>

          {/* 证书 */}
          <div className="space-y-2">
            <Label htmlFor="certifications">资质证书</Label>
            <Input
              id="certifications"
              value={formData.certifications}
              onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              placeholder="多个用顿号分隔"
            />
          </div>

          {/* 教龄和课时费 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="experience">教龄（年）</Label>
              <Input
                id="experience"
                type="number"
                min={1}
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">
                课时费（元/节）<span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                min={1}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* 预约规则 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAdvanceHours">最少提前预约（小时）</Label>
              <Input
                id="minAdvanceHours"
                type="number"
                min={0}
                value={formData.minAdvanceHours}
                onChange={(e) => setFormData({ ...formData, minAdvanceHours: e.target.value })}
                placeholder="留空使用默认值(1小时)"
              />
              <p className="text-xs text-muted-foreground">用户必须提前多少小时预约</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="freeCancelHours">免费取消提前（小时）</Label>
              <Input
                id="freeCancelHours"
                type="number"
                min={0}
                value={formData.freeCancelHours}
                onChange={(e) => setFormData({ ...formData, freeCancelHours: e.target.value })}
                placeholder="留空使用默认值(24小时)"
              />
              <p className="text-xs text-muted-foreground">开课前多少小时内取消需扣费</p>
            </div>
          </div>

          {/* 状态和排序 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">状态</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">在职</SelectItem>
                  <SelectItem value="leave">休假</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">排序权重</Label>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">数字越大排名越靠前，如：100=置顶，0=默认</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "保存" : "创建"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
