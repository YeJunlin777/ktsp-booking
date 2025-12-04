import type { ApiResponse } from "./response";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// 统一请求封装
async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // 处理URL参数
  let url = `${BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // 默认请求头
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    const error = new Error(data.error?.message || "请求失败");
    (error as Error & { code?: string }).code = data.error?.code;
    throw error;
  }

  return data.data as T;
}

// GET 请求
export function get<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  return request<T>(endpoint, { method: "GET", params });
}

// POST 请求
export function post<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

// PUT 请求
export function put<T>(endpoint: string, body?: unknown): Promise<T> {
  return request<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

// DELETE 请求
export function del<T>(endpoint: string): Promise<T> {
  return request<T>(endpoint, { method: "DELETE" });
}

// API 接口集合
export const api = {
  // 认证
  auth: {
    sendCode: (phone: string) => post("/api/auth/send-code", { phone }),
    login: (phone: string, code: string) => post("/api/auth/login", { phone, code }),
  },

  // 用户
  user: {
    getProfile: () => get("/api/user/profile"),
    updateProfile: (data: { nickname?: string; avatar?: string }) =>
      put("/api/user/profile", data),
    getPoints: () => get("/api/user/points"),
  },

  // 场地
  venues: {
    list: () => get("/api/venues"),
    getSlots: (venueId: string, date: string) =>
      get(`/api/venues/${venueId}/slots`, { date }),
  },

  // 预约
  bookings: {
    create: (data: unknown) => post("/api/bookings", data),
    list: (params?: { status?: string; page?: number }) =>
      get("/api/bookings/my", params),
    cancel: (id: string, reason?: string) =>
      put(`/api/bookings/${id}/cancel`, { reason }),
  },

  // 教练
  coaches: {
    list: () => get("/api/coaches"),
    getSchedule: (coachId: string, date: string) =>
      get(`/api/coaches/${coachId}/schedule`, { date }),
  },

  // 签到
  checkin: {
    do: () => post("/api/checkin"),
    getCalendar: (month: string) => get("/api/checkin/calendar", { month }),
  },

  // 积分商城
  products: {
    list: () => get("/api/products"),
    redeem: (productId: string, data?: unknown) =>
      post(`/api/products/${productId}/redeem`, data),
  },

  // 消息
  messages: {
    list: (params?: { page?: number }) => get("/api/messages", params),
    markRead: (id: string) => put(`/api/messages/${id}/read`),
  },

  // 优惠码
  coupon: {
    verify: (code: string, amount: number) =>
      post("/api/coupon/verify", { code, amount }),
  },
};
