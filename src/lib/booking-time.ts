/**
 * 预约时间工具库
 * 
 * 【职责】封装所有时间相关的计算和校验逻辑
 * 【复用】前后端共用，确保逻辑一致
 */

import { bookingConfig } from "@/config";

// ==================== 类型定义 ====================

export interface TimeRange {
  startTime: string;  // HH:mm 格式
  endTime: string;    // HH:mm 格式
}

export interface TimeSlot extends TimeRange {
  date: string;       // YYYY-MM-DD 格式
}

export interface BookedSlot extends TimeRange {
  id?: string;
  userId?: string;
  userName?: string;
}

export type TimeValidationError = 
  | "SLOT_CONFLICT"
  | "SLOT_PAST"
  | "SLOT_TOO_SOON"
  | "SLOT_OUTSIDE_HOURS"
  | "INVALID_DURATION"
  | "CROSS_DAY"
  | null;

// ==================== 时间转换工具 ====================

/**
 * 将 HH:mm 格式转换为分钟数
 */
export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

/**
 * 将分钟数转换为 HH:mm 格式
 */
export function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * 计算结束时间
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const startMinutes = timeToMinutes(startTime);
  return minutesToTime(startMinutes + durationMinutes);
}

/**
 * 计算时长（分钟）
 */
export function calculateDuration(startTime: string, endTime: string): number {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

// ==================== 时间段重叠检测 ====================

/**
 * 检测两个时间段是否重叠
 * 
 * 重叠条件：A开始 < B结束 AND A结束 > B开始
 */
export function isTimeRangeOverlap(rangeA: TimeRange, rangeB: TimeRange): boolean {
  const aStart = timeToMinutes(rangeA.startTime);
  const aEnd = timeToMinutes(rangeA.endTime);
  const bStart = timeToMinutes(rangeB.startTime);
  const bEnd = timeToMinutes(rangeB.endTime);
  
  return aStart < bEnd && aEnd > bStart;
}

/**
 * 检测时间段是否与已预约列表中的任何时段冲突
 * 
 * @returns 冲突的预约列表
 */
export function findConflicts(
  newRange: TimeRange,
  bookedSlots: BookedSlot[]
): BookedSlot[] {
  return bookedSlots.filter(slot => isTimeRangeOverlap(newRange, slot));
}

/**
 * 检测时间段是否可用（无冲突）
 */
export function isTimeRangeAvailable(
  newRange: TimeRange,
  bookedSlots: BookedSlot[]
): boolean {
  return findConflicts(newRange, bookedSlots).length === 0;
}

// ==================== 时间边界校验 ====================

/**
 * 检测时间是否已过期
 * 
 * @param date 日期 YYYY-MM-DD
 * @param startTime 开始时间 HH:mm
 * @returns 是否已过期
 */
export function isTimePast(date: string, startTime: string): boolean {
  const now = new Date();
  const slotDate = new Date(date);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // 不是今天，检查日期
  if (slotDate < today) return true;
  if (slotDate > today) return false;
  
  // 今天，检查时间
  const { minAdvanceMinutes } = bookingConfig.concurrency;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slotMinutes = timeToMinutes(startTime);
  
  return slotMinutes < currentMinutes + minAdvanceMinutes;
}

/**
 * 检测时间是否在营业时间内
 */
export function isWithinBusinessHours(
  startTime: string,
  endTime: string,
  openTime: string,
  closeTime: string
): boolean {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const open = timeToMinutes(openTime);
  const close = timeToMinutes(closeTime);
  
  return start >= open && end <= close;
}

/**
 * 检测是否跨天
 */
export function isCrossDay(startTime: string, endTime: string): boolean {
  return timeToMinutes(endTime) <= timeToMinutes(startTime);
}

/**
 * 检测预约日期是否在允许范围内
 */
export function isDateInRange(date: string): boolean {
  const { maxAdvanceDays } = bookingConfig.timeBoundary;
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxAdvanceDays);
  
  return bookingDate >= today && bookingDate <= maxDate;
}

/**
 * 检测时长是否合法
 */
export function isDurationValid(durationMinutes: number): boolean {
  const { minDuration, maxDuration, timeGranularity } = bookingConfig.timeBoundary;
  
  return (
    durationMinutes >= minDuration &&
    durationMinutes <= maxDuration &&
    durationMinutes % timeGranularity === 0
  );
}

// ==================== 综合校验 ====================

export interface TimeValidationResult {
  valid: boolean;
  error: TimeValidationError;
  message: string;
  conflicts?: BookedSlot[];
}

/**
 * 综合校验时间段
 * 
 * 检测所有可能的问题：过期、营业时间、冲突等
 */
export function validateTimeSlot(
  slot: TimeSlot,
  durationMinutes: number,
  openTime: string,
  closeTime: string,
  bookedSlots: BookedSlot[]
): TimeValidationResult {
  const { startTime, date } = slot;
  const endTime = calculateEndTime(startTime, durationMinutes);
  const { errors, concurrency, timeBoundary } = bookingConfig;
  
  // 1. 检测时长
  if (!isDurationValid(durationMinutes)) {
    return {
      valid: false,
      error: "INVALID_DURATION",
      message: `时长必须在${timeBoundary.minDuration}-${timeBoundary.maxDuration}分钟之间`,
    };
  }
  
  // 2. 检测跨天
  if (!timeBoundary.allowCrossDay && isCrossDay(startTime, endTime)) {
    return {
      valid: false,
      error: "CROSS_DAY",
      message: "暂不支持跨天预约",
    };
  }
  
  // 3. 检测营业时间
  if (!isWithinBusinessHours(startTime, endTime, openTime, closeTime)) {
    return {
      valid: false,
      error: "SLOT_OUTSIDE_HOURS",
      message: errors.SLOT_OUTSIDE_HOURS,
    };
  }
  
  // 4. 检测是否过期
  if (isTimePast(date, startTime)) {
    return {
      valid: false,
      error: "SLOT_PAST",
      message: errors.SLOT_TOO_SOON.replace("{minutes}", String(concurrency.minAdvanceMinutes)),
    };
  }
  
  // 5. 检测冲突
  const newRange: TimeRange = { startTime, endTime };
  const conflicts = findConflicts(newRange, bookedSlots);
  
  if (conflicts.length > 0) {
    return {
      valid: false,
      error: "SLOT_CONFLICT",
      message: errors.SLOT_CONFLICT,
      conflicts,
    };
  }
  
  return { valid: true, error: null, message: "" };
}

// ==================== 时段生成工具 ====================

/**
 * 生成可选时段列表
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  date: string,
  bookedSlots: BookedSlot[]
): Array<{
  startTime: string;
  endTime: string;
  available: boolean;
  isPast: boolean;
  conflicts: BookedSlot[];
}> {
  const { timeGranularity } = bookingConfig.timeBoundary;
  const slots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    isPast: boolean;
    conflicts: BookedSlot[];
  }> = [];
  
  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);
  
  for (let start = openMinutes; start < closeMinutes; start += timeGranularity) {
    const end = start + durationMinutes;
    
    // 超出营业时间
    if (end > closeMinutes) break;
    
    const startTime = minutesToTime(start);
    const endTime = minutesToTime(end);
    const range: TimeRange = { startTime, endTime };
    
    const isPast = isTimePast(date, startTime);
    const conflicts = findConflicts(range, bookedSlots);
    
    slots.push({
      startTime,
      endTime,
      available: !isPast && conflicts.length === 0,
      isPast,
      conflicts,
    });
  }
  
  return slots;
}

/**
 * 获取建议时段（最近可用的N个时段）
 */
export function getSuggestedSlots(
  openTime: string,
  closeTime: string,
  durationMinutes: number,
  date: string,
  bookedSlots: BookedSlot[],
  count: number = 3
): Array<{ startTime: string; endTime: string }> {
  const allSlots = generateTimeSlots(openTime, closeTime, durationMinutes, date, bookedSlots);
  
  return allSlots
    .filter(slot => slot.available)
    .slice(0, count)
    .map(({ startTime, endTime }) => ({ startTime, endTime }));
}
