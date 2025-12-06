"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, UserX, Phone } from "lucide-react";
import { get, del } from "@/lib/api";
import { toast } from "sonner";
import { courseConfig } from "@/config";

interface Student {
  bookingId: string;
  userId: string;
  name: string;
  phone?: string;
  avatar?: string;
  status: string;
  enrolledAt: string;
}

interface CourseStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: string | null;
  courseName: string | null;
}

/**
 * 课程报名学员弹窗
 * 
 * 【职责】展示课程报名学员列表，支持移除学员
 */
export function CourseStudentsDialog({
  open,
  onOpenChange,
  courseId,
  courseName,
}: CourseStudentsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [removing, setRemoving] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const result = await get<{ students: Student[] }>(
        `/api/admin/courses/${courseId}/students`
      );
      setStudents(result?.students || []);
    } catch (error) {
      console.error("获取学员列表失败:", error);
      toast.error(courseConfig.admin.texts.fetchStudentsFailed);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (open && courseId) {
      fetchStudents();
    }
  }, [open, courseId, fetchStudents]);

  const handleRemove = async (student: Student) => {
    if (!confirm(`确定要移除学员「${student.name}」吗？`)) {
      return;
    }

    try {
      setRemoving(student.bookingId);
      await del(`/api/admin/courses/${courseId}/students/${student.bookingId}`);
      toast.success(courseConfig.admin.texts.studentRemoved);
      fetchStudents();
    } catch (error) {
      console.error("移除学员失败:", error);
      toast.error("移除失败");
    } finally {
      setRemoving(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {courseName} - 报名学员（{students.length}人）
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            暂无报名学员
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student, index) => (
              <div
                key={student.bookingId}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{student.name}</div>
                    {student.phone && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        {student.phone}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      报名时间：{formatDate(student.enrolledAt)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(student)}
                  disabled={removing === student.bookingId}
                >
                  {removing === student.bookingId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserX className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
