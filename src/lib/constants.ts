// ==================== 订单状态 ====================
export const BOOKING_STATUS = {
  PENDING: "pending",       // 待确认
  CONFIRMED: "confirmed",   // 已确认
  COMPLETED: "completed",   // 已完成
  CANCELLED: "cancelled",   // 已取消
  NO_SHOW: "no_show",       // 未到场
} as const;

export const BOOKING_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待确认", color: "yellow" },
  confirmed: { label: "已确认", color: "blue" },
  completed: { label: "已完成", color: "green" },
  cancelled: { label: "已取消", color: "gray" },
  no_show: { label: "未到场", color: "red" },
};

// ==================== 预约类型 ====================
export const BOOKING_TYPE = {
  VENUE: "venue",     // 场地预约
  COACH: "coach",     // 教练预约
  COURSE: "course",   // 课程报名
} as const;

export const BOOKING_TYPE_MAP: Record<string, string> = {
  venue: "场地预约",
  coach: "教练预约",
  course: "课程报名",
};

// ==================== 会员等级 ====================
export const MEMBER_LEVELS = [
  { level: "普通会员", minPoints: 0, discount: 1 },
  { level: "银卡会员", minPoints: 1000, discount: 0.95 },
  { level: "金卡会员", minPoints: 5000, discount: 0.9 },
  { level: "钻石会员", minPoints: 20000, discount: 0.85 },
] as const;

// ==================== 实名认证状态 ====================
export const VERIFY_STATUS = {
  UNVERIFIED: "未认证",
  PENDING: "待审核",
  VERIFIED: "已认证",
  REJECTED: "已拒绝",
} as const;

export const VERIFY_STATUS_MAP: Record<string, { label: string; color: string }> = {
  未认证: { label: "未认证", color: "gray" },
  待审核: { label: "待审核", color: "yellow" },
  已认证: { label: "已认证", color: "green" },
  已拒绝: { label: "已拒绝", color: "red" },
};

// ==================== 积分类型 ====================
export const POINT_TYPE = {
  CHECKIN: "checkin",     // 签到
  BOOKING: "booking",     // 预约消费
  REDEEM: "redeem",       // 积分兑换
  INVITE: "invite",       // 邀请奖励
  ADMIN: "admin",         // 后台调整
} as const;

export const POINT_TYPE_MAP: Record<string, string> = {
  checkin: "签到奖励",
  booking: "消费积分",
  redeem: "积分兑换",
  invite: "邀请奖励",
  admin: "后台调整",
};

// ==================== 签到积分规则 ====================
export const CHECKIN_POINTS = {
  BASE: 10,           // 基础积分
  STREAK_3: 20,       // 连续3天
  STREAK_7: 50,       // 连续7天
  STREAK_30: 200,     // 连续30天
} as const;

// ==================== 优惠券类型 ====================
export const COUPON_TYPE = {
  FIXED: "fixed",       // 固定金额
  PERCENT: "percent",   // 折扣百分比
} as const;

// ==================== 消息类型 ====================
export const MESSAGE_TYPE = {
  SYSTEM: "system",     // 系统通知
  BOOKING: "booking",   // 预约通知
  POINTS: "points",     // 积分变动
  PROMO: "promo",       // 营销活动
} as const;

// ==================== 场地类型 ====================
export const VENUE_TYPE = {
  DRIVING_RANGE: "driving_range",   // 练习场
  SIMULATOR: "simulator",           // 模拟器
  COURSE: "course",                 // 球场
} as const;

export const VENUE_TYPE_MAP: Record<string, string> = {
  driving_range: "练习场",
  simulator: "模拟器",
  course: "球场",
};

// ==================== 管理员角色 ====================
export const ADMIN_ROLE = {
  ADMIN: "admin",   // 管理员
  STAFF: "staff",   // 员工
} as const;

// ==================== 分页默认值 ====================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// ==================== 时间格式 ====================
export const DATE_FORMAT = {
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm",
  DATETIME: "YYYY-MM-DD HH:mm",
  FULL: "YYYY-MM-DD HH:mm:ss",
} as const;
