"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Plus,
  Trash2,
  Clock,
  Copy,
} from "lucide-react";
import { get, post, put, del } from "@/lib/api";
import { toast } from "sonner";
import { coachConfig } from "@/config";

interface Coach {
  id: string;
  name: string;
}

interface Schedule {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface CoachScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coach: Coach | null;
}

// 生成时间选项（从配置读取）
const generateTimeOptions = () => {
  const { startHour, endHour, interval } = coachConfig.schedule;
  const options: string[] = [];
  
  for (let hour = startHour; hour <= endHour; hour++) {
    if (interval === 60) {
      // 整点
      options.push(`${hour.toString().padStart(2, "0")}:00`);
    } else if (interval === 30) {
      // 半点
      options.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < endHour) {
        options.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }
  }
  
  return options;
};

const timeOptions = generateTimeOptions();

/**
 * 教练排班管理弹窗
 * 
 * 【职责】管理教练的可预约时段
 */
export function CoachScheduleDialog({
  open,
  onOpenChange,
  coach,
}: CoachScheduleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [newSlot, setNewSlot] = useState({ startTime: "09:00", endTime: "10:00" });

  // 获取当前周的日期
  const getWeekDates = useCallback((baseDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(baseDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const weekDates = getWeekDates(selectedDate);
  const weekDayNames = ["日", "一", "二", "三", "四", "五", "六"];

  // 获取排班数据
  const fetchSchedules = useCallback(async (baseDate: Date) => {
    if (!coach) return;

    try {
      setLoading(true);
      const dates = getWeekDates(baseDate);
      const startDate = dates[0].toISOString().split("T")[0];
      const endDate = dates[6].toISOString().split("T")[0];

      const result = await get<{ schedules: Record<string, Schedule[]> }>(
        `/api/admin/coaches/${coach.id}/schedule?startDate=${startDate}&endDate=${endDate}`
      );
      setSchedules(result?.schedules || {});
    } catch (error) {
      console.error("获取排班失败:", error);
      toast.error(coachConfig.admin.texts.fetchScheduleFailed);
    } finally {
      setLoading(false);
    }
  }, [coach, getWeekDates]);

  // 只在弹窗打开时加载
  useEffect(() => {
    if (open && coach) {
      fetchSchedules(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, coach?.id]);

  // 上一周
  const prevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
    fetchSchedules(newDate);
  };

  // 下一周
  const nextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
    fetchSchedules(newDate);
  };

  // 格式化日期显示
  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 获取日期的 key
  const getDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // 添加时段
  const handleAddSlot = async (date: Date) => {
    if (!coach) return;

    if (newSlot.startTime >= newSlot.endTime) {
      toast.error("结束时间必须晚于开始时间");
      return;
    }

    try {
      setSaving(true);
      const dateStr = getDateKey(date);
      const existingSlots = schedules[dateStr] || [];

      await put(`/api/admin/coaches/${coach.id}/schedule`, {
        date: dateStr,
        slots: [
          ...existingSlots.map((s) => ({ startTime: s.startTime, endTime: s.endTime })),
          { startTime: newSlot.startTime, endTime: newSlot.endTime },
        ],
      });

      toast.success("时段已添加");
      fetchSchedules(selectedDate);
    } catch (error) {
      console.error("添加时段失败:", error);
      toast.error("添加时段失败");
    } finally {
      setSaving(false);
    }
  };

  // 删除时段
  const handleDeleteSlot = async (scheduleId: string, isBooked: boolean) => {
    if (!coach) return;

    if (isBooked) {
      toast.error("该时段已被预约，无法删除");
      return;
    }

    try {
      setSaving(true);
      await del(`/api/admin/coaches/${coach.id}/schedule?scheduleId=${scheduleId}`);
      toast.success("时段已删除");
      fetchSchedules(selectedDate);
    } catch (error) {
      console.error("删除时段失败:", error);
      toast.error("删除时段失败");
    } finally {
      setSaving(false);
    }
  };

  // 复制上周排班
  const handleCopyLastWeek = async () => {
    if (!coach) return;

    const confirmed = confirm("确定要复制上周排班到本周？已有的排班会被保留。");
    if (!confirmed) return;

    try {
      setSaving(true);
      const result = await post<{ copiedCount: number; message: string }>(
        `/api/admin/coaches/${coach.id}/schedule/copy`,
        { copyLastWeek: true }
      );
      toast.success(result?.message || "复制成功");
      fetchSchedules(selectedDate);
    } catch (error) {
      console.error("复制排班失败:", error);
      toast.error("复制失败，请确认上周有排班数据");
    } finally {
      setSaving(false);
    }
  };

  // 快速设置一周排班
  const handleQuickSetup = async () => {
    if (!coach) return;

    const confirmed = confirm("确定要为本周设置默认排班（周日至周六 9:00-18:00）？已有排班不会被覆盖。");
    if (!confirmed) return;

    try {
      setSaving(true);
      
      const scheduleData: { date: string; startTime: string; endTime: string }[] = [];
      
      // 周日到周六（全周）
      for (let i = 0; i <= 6; i++) {
        const date = weekDates[i];
        const dateStr = getDateKey(date);
        
        // 如果该日期已有排班，跳过
        if (schedules[dateStr] && schedules[dateStr].length > 0) {
          continue;
        }

        // 9:00 - 18:00，每小时一个时段
        for (let hour = 9; hour < 18; hour++) {
          scheduleData.push({
            date: dateStr,
            startTime: `${hour.toString().padStart(2, "0")}:00`,
            endTime: `${(hour + 1).toString().padStart(2, "0")}:00`,
          });
        }
      }

      if (scheduleData.length === 0) {
        toast.info("本周已有排班，无需设置");
        return;
      }

      await put(`/api/admin/coaches/${coach.id}/schedule`, {
        schedules: scheduleData,
      });

      toast.success(`已设置${scheduleData.length}个时段`);
      fetchSchedules(selectedDate);
    } catch (error) {
      console.error("快速设置失败:", error);
      toast.error("设置失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coach?.name} - 排班管理
          </DialogTitle>
        </DialogHeader>

        {/* 周选择器 */}
        <div className="flex items-center justify-between border-b pb-4">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
            上一周
          </Button>
          <span className="font-medium">
            {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </span>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            下一周
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 快速操作 */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleQuickSetup} disabled={saving}>
            快速设置本周排班
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyLastWeek} disabled={saving}>
            <Copy className="h-4 w-4 mr-1" />
            复制上周排班
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>新增时段：</span>
            <select
              aria-label="开始时间"
              className="rounded border px-2 py-1"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span>-</span>
            <select
              aria-label="结束时间"
              className="rounded border px-2 py-1"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
            >
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 排班表格 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((date, index) => {
              const dateKey = getDateKey(date);
              const daySchedules = schedules[dateKey] || [];
              const isToday = dateKey === getDateKey(new Date());
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <div
                  key={dateKey}
                  className={`rounded-lg border p-2 min-h-[200px] ${
                    isToday ? "border-primary bg-primary/5" : ""
                  } ${isPast ? "opacity-50" : ""}`}
                >
                  {/* 日期头 */}
                  <div className="mb-2 text-center">
                    <div className="text-xs text-muted-foreground">
                      周{weekDayNames[index]}
                    </div>
                    <div className={`font-medium ${isToday ? "text-primary" : ""}`}>
                      {formatDate(date)}
                    </div>
                  </div>

                  {/* 时段列表 */}
                  <div className="space-y-1">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className={`group flex items-center justify-between rounded px-1.5 py-1 text-xs ${
                          schedule.isBooked
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span className="whitespace-nowrap">{schedule.startTime}-{schedule.endTime}</span>
                        </span>
                        {!schedule.isBooked && !isPast && (
                          <button
                            onClick={() => handleDeleteSlot(schedule.id, schedule.isBooked)}
                            className="text-red-500 hover:text-red-700"
                            disabled={saving}
                            title="删除时段"
                            aria-label="删除时段"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 添加按钮 */}
                  {!isPast && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 w-full text-xs"
                      onClick={() => handleAddSlot(date)}
                      disabled={saving}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      添加
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 图例 */}
        <div className="flex items-center gap-4 border-t pt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-100"></div>
            <span>可预约</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-100"></div>
            <span>已预约</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
