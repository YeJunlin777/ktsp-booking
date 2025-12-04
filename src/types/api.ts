// ==================== 通用类型 ====================

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ==================== 用户相关 ====================

export interface LoginByPhoneRequest {
  phone: string;
  code: string;
}

export interface UserProfile {
  id: string;
  phone?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  memberLevel: string;
  points: number;
  verifyStatus: string;
  inviteCode?: string;
}

export interface UpdateProfileRequest {
  nickname?: string;
  avatar?: string;
}

// ==================== 预约相关 ====================

export interface VenueListItem {
  id: string;
  name: string;
  type: string;
  description?: string;
  image?: string;
  status: string;
}

export interface TimeSlotItem {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable: boolean;
}

export interface CreateBookingRequest {
  venueId?: string;
  coachId?: string;
  courseId?: string;
  bookingType: "venue" | "coach" | "course";
  bookingDate: string;
  startTime: string;
  endTime: string;
  playerCount?: number;
  players?: Array<{ name: string; phone?: string }>;
  couponCode?: string;
}

export interface BookingListItem {
  id: string;
  orderNo: string;
  bookingType: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  venueName?: string;
  coachName?: string;
  courseName?: string;
  finalPrice: number;
  status: string;
  createdAt: string;
}

// ==================== 教练相关 ====================

export interface CoachListItem {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  specialty?: string;
  price: number;
  rating: number;
  reviewCount: number;
}

export interface CoachScheduleItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

// ==================== 积分相关 ====================

export interface CheckinResult {
  points: number;
  streakDays: number;
  isFirstCheckin: boolean;
}

export interface PointLogItem {
  id: string;
  type: string;
  points: number;
  balance: number;
  remark?: string;
  createdAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  points: number;
  stock: number;
  type: string;
}

export interface RedeemProductRequest {
  productId: string;
  quantity?: number;
  address?: {
    name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    detail: string;
  };
}

// ==================== 优惠码 ====================

export interface VerifyCouponRequest {
  code: string;
  amount: number;
}

export interface CouponInfo {
  code: string;
  type: "fixed" | "percent";
  value: number;
  discountAmount: number;
}

// ==================== 消息 ====================

export interface MessageListItem {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}
