"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { post, put, get } from "@/lib/api";
import { toast } from "sonner";
import { courseConfig } from "@/config";

interface Course {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  coachId?: string;
  coachName?: string;
  totalLessons: number;
  maxStudents: number;
  price: number;
  startDate: string;
  endDate: string;
  enrollDeadline?: string;
  schedule?: string;
  requirements?: string;
  status: string;
}

interface Coach {
  id: string;
  name: string;
}

interface CourseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSuccess: () => void;
}

const { categories } = courseConfig;

/**
 * 课程新增/编辑弹窗
 */
export function CourseFormDialog({
  open,
  onOpenChange,
  course,
  onSuccess,
}: CourseFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    category: "beginner",
    coachId: "",
    coachName: "",
    totalLessons: 4,
    maxStudents: 10,
    price: 800,
    startDate: "",
    endDate: "",
    enrollDeadline: "",
    schedule: "",
    requirements: "",
  });

  const isEdit = !!course;

  // 获取教练列表
  useEffect(() => {
    if (open) {
      get<Coach[]>("/api/admin/coaches").then(setCoaches).catch(console.error);
    }
  }, [open]);

  // 编辑时填充数据
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || "",
        description: course.description || "",
        image: course.image || "",
        category: course.category || "beginner",
        coachId: course.coachId || "",
        coachName: course.coachName || "",
        totalLessons: course.totalLessons || 4,
        maxStudents: course.maxStudents || 10,
        price: course.price || 800,
        startDate: course.startDate || "",
        endDate: course.endDate || "",
        enrollDeadline: course.enrollDeadline || "",
        schedule: course.schedule || "",
        requirements: course.requirements || "",
      });
    } else {
      // 新增时重置表单
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData({
        name: "",
        description: "",
        image: "",
        category: "beginner",
        coachId: "",
        coachName: "",
        totalLessons: 4,
        maxStudents: 10,
        price: 800,
        startDate: nextWeek.toISOString().split("T")[0],
        endDate: "",
        enrollDeadline: today.toISOString().split("T")[0],
        schedule: "",
        requirements: "",
      });
    }
  }, [course, open]);

  // 选择教练时同步名字
  const handleCoachChange = (coachId: string) => {
    const coach = coaches.find(c => c.id === coachId);
    setFormData({
      ...formData,
      coachId,
      coachName: coach?.name || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("请输入课程名称");
      return;
    }

    if (formData.maxStudents <= 0) {
      toast.error("最大人数必须大于0");
      return;
    }

    if (formData.price <= 0) {
      toast.error("课程价格必须大于0");
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error("请选择开始和结束日期");
      return;
    }

    try {
      setLoading(true);

      // 状态由后端自动计算，不需要手动传递
      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        image: formData.image || null,
        category: formData.category,
        coachId: formData.coachId || null,
        coachName: formData.coachName || null,
        totalLessons: formData.totalLessons,
        maxStudents: formData.maxStudents,
        price: formData.price,
        startDate: formData.startDate,
        endDate: formData.endDate,
        enrollDeadline: formData.enrollDeadline || null,
        schedule: formData.schedule.trim() || null,
        requirements: formData.requirements.trim() || null,
      };

      if (isEdit && course) {
        await put(`/api/admin/courses/${course.id}`, data);
        toast.success(courseConfig.admin.texts.updateSuccess);
      } else {
        await post("/api/admin/courses", data);
        toast.success(courseConfig.admin.texts.createSuccess);
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("保存课程失败:", error);
      toast.error(isEdit ? "更新失败" : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑课程" : "新增课程"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">课程名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：高尔夫入门班"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">课程分类</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c.key !== "all").map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">课程简介</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="课程介绍..."
              rows={3}
            />
          </div>

          {/* 课程封面 */}
          <div className="space-y-2">
            <Label>课程封面</Label>
            <ImageUpload
              value={formData.image || null}
              onChange={(url) => setFormData({ ...formData, image: url || "" })}
            />
          </div>

          {/* 教练和人数 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="coach">授课教练</Label>
              <Select
                value={formData.coachId}
                onValueChange={handleCoachChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择教练" />
                </SelectTrigger>
                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalLessons">总课时数</Label>
              <Input
                id="totalLessons"
                type="number"
                min={1}
                value={formData.totalLessons}
                onChange={(e) => setFormData({ ...formData, totalLessons: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxStudents">最大人数 *</Label>
              <Input
                id="maxStudents"
                type="number"
                min={1}
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          {/* 价格 */}
          <div className="space-y-2">
            <Label htmlFor="price">课程价格 *</Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground">课程状态将根据日期和人数自动计算</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">开课日期 *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">结课日期 *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollDeadline">报名截止</Label>
              <Input
                id="enrollDeadline"
                type="date"
                value={formData.enrollDeadline}
                onChange={(e) => setFormData({ ...formData, enrollDeadline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schedule">上课时间</Label>
            <Input
              id="schedule"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
              placeholder="如：每周六 09:00-11:00"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "保存修改" : "创建课程"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
