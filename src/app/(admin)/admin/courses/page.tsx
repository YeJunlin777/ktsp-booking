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
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { get, del } from "@/lib/api";
import { toast } from "sonner";
import { courseConfig } from "@/config";
import { CourseFormDialog, CourseStudentsDialog } from "@/components/admin/course";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pagination } from "@/components/ui/pagination";

interface Course {
  id: string;
  name: string;
  description?: string;
  image?: string;
  category?: string;
  coachName?: string;
  totalLessons: number;
  maxStudents: number;
  enrolled: number;
  price: number;
  startDate: string;
  endDate: string;
  schedule?: string;
  status: string;
}

const { status: statusConfig, categories, admin } = courseConfig;
const { texts: adminTexts, texts: { tableHeaders } } = admin;

/**
 * 课程管理页面
 */
interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  // 弹窗状态
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // 学员弹窗状态
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [studentsDialogCourse, setStudentsDialogCourse] = useState<{ id: string; name: string } | null>(null);
  
  // 删除确认弹窗状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const fetchCourses = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchKeyword) params.set("keyword", searchKeyword);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(pageNum));
      params.set("pageSize", "20");
      
      const response = await fetch(`/api/admin/courses?${params}`);
      const result = await response.json();
      if (result.success) {
        setCourses(result.data || []);
        if (result.meta) {
          setPagination(result.meta);
        }
      }
    } catch (error) {
      console.error("获取课程列表失败:", error);
      toast.error(adminTexts.fetchListFailed);
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, statusFilter, page]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleSearch = () => {
    setPage(1);
    fetchCourses(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchCourses(newPage);
  };

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    
    try {
      setDeleting(courseToDelete.id);
      await del(`/api/admin/courses/${courseToDelete.id}`);
      toast.success(courseConfig.admin.texts.deleteSuccess);
      setDeleteDialogOpen(false);
      fetchCourses();
    } catch (error) {
      console.error("删除课程失败:", error);
      toast.error(adminTexts.deleteFailed);
    } finally {
      setDeleting(null);
    }
  };

  const handleAdd = () => {
    setSelectedCourse(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setFormDialogOpen(true);
  };

  const getCategoryLabel = (key: string) => {
    const found = categories.find(c => c.key === key);
    return found?.label || key;
  };

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
            <select
              aria-label="状态筛选"
              className="rounded-md border px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{adminTexts.allStatus}</option>
              {Object.entries(statusConfig).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
            <Button variant="outline" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              {adminTexts.searchButton}
            </Button>
            <Button variant="outline" onClick={() => fetchCourses()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {adminTexts.refreshButton}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 课程列表 */}
      <Card>
        <CardHeader>
          <CardTitle>{adminTexts.listTitle}（{courses.length}门）</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">{adminTexts.loadingText}</span>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {adminTexts.emptyText}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">{tableHeaders.name}</th>
                    <th className="pb-3 font-medium">{tableHeaders.category}</th>
                    <th className="pb-3 font-medium">{tableHeaders.coach}</th>
                    <th className="pb-3 font-medium">{tableHeaders.lessons}</th>
                    <th className="pb-3 font-medium">{tableHeaders.enrollment}</th>
                    <th className="pb-3 font-medium">{tableHeaders.price}</th>
                    <th className="pb-3 font-medium">{tableHeaders.startDate}</th>
                    <th className="pb-3 font-medium">{tableHeaders.status}</th>
                    <th className="pb-3 font-medium">{tableHeaders.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {courses.map((course) => (
                    <tr key={course.id} className="text-sm">
                      <td className="py-4 font-medium">{course.name}</td>
                      <td className="py-4">{getCategoryLabel(course.category || "")}</td>
                      <td className="py-4">{course.coachName || "待定"}</td>
                      <td className="py-4">{course.totalLessons}节</td>
                      <td className="py-4">
                        <span className={course.enrolled >= course.maxStudents ? "text-red-500" : ""}>
                          {course.enrolled}/{course.maxStudents}
                        </span>
                      </td>
                      <td className="py-4">¥{course.price}</td>
                      <td className="py-4">{course.startDate}</td>
                      <td className="py-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs ${
                            statusConfig[course.status as keyof typeof statusConfig]?.color || ""
                          }`}
                        >
                          {statusConfig[course.status as keyof typeof statusConfig]?.label || course.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="报名学员"
                            onClick={() => {
                              setStudentsDialogCourse({ id: course.id, name: course.name });
                              setStudentsDialogOpen(true);
                            }}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="编辑"
                            onClick={() => handleEdit(course)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title="删除"
                            onClick={() => handleDeleteClick(course)}
                            disabled={deleting === course.id}
                          >
                            {deleting === course.id ? (
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
          
          {/* 分页 */}
          {pagination && pagination.totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>

      {/* 新增/编辑弹窗 */}
      <CourseFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        course={selectedCourse}
        onSuccess={fetchCourses}
      />

      {/* 报名学员弹窗 */}
      <CourseStudentsDialog
        open={studentsDialogOpen}
        onOpenChange={setStudentsDialogOpen}
        courseId={studentsDialogCourse?.id || null}
        courseName={studentsDialogCourse?.name || null}
      />

      {/* 删除确认弹窗 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={adminTexts.deleteTitle}
        description={`确定要删除课程「${courseToDelete?.name}」吗？${adminTexts.deleteConfirm}`}
        confirmText={adminTexts.deleteButton}
        cancelText="取消"
        onConfirm={handleDeleteConfirm}
        variant="destructive"
        loading={!!deleting}
      />
    </div>
  );
}
