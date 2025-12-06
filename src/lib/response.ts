import { NextResponse } from "next/server";

// 统一响应格式
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
}

// 成功响应
export function success<T>(data: T, meta?: ApiResponse["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    meta,
  });
}

// 分页成功响应
export function successWithPagination<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: { page, pageSize, total },
  });
}

// 错误响应
export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...details },
    },
    { status }
  );
}

// 常用错误
export const Errors = {
  // 认证相关
  UNAUTHORIZED: (msg = "请先登录") => error("UNAUTHORIZED", msg, 401),
  FORBIDDEN: (msg = "无权限访问") => error("FORBIDDEN", msg, 403),
  TOKEN_EXPIRED: () => error("TOKEN_EXPIRED", "登录已过期，请重新登录", 401),
  
  // 参数相关
  INVALID_PARAMS: (msg = "参数错误", details?: Record<string, unknown>) => 
    error("INVALID_PARAMS", msg, 400, details),
  MISSING_PARAMS: (field: string) => error("MISSING_PARAMS", `缺少必填参数: ${field}`, 400),
  
  // 资源相关
  NOT_FOUND: (resource = "资源") => error("NOT_FOUND", `${resource}不存在`, 404),
  ALREADY_EXISTS: (resource = "资源") => error("ALREADY_EXISTS", `${resource}已存在`, 409),
  
  // 业务相关
  BOOKING_CONFLICT: () => error("BOOKING_CONFLICT", "该时段已被预约", 409),
  INSUFFICIENT_POINTS: () => error("INSUFFICIENT_POINTS", "积分不足", 400),
  STOCK_NOT_ENOUGH: () => error("STOCK_NOT_ENOUGH", "库存不足", 400),
  COUPON_INVALID: () => error("COUPON_INVALID", "优惠码无效或已过期", 400),
  ALREADY_CHECKED_IN: () => error("ALREADY_CHECKED_IN", "今日已签到", 400),
  
  // 系统错误
  INTERNAL_ERROR: () => error("INTERNAL_ERROR", "服务器内部错误", 500),
  DB_ERROR: () => error("DB_ERROR", "数据库操作失败", 500),
};
