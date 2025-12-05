/**
 * 预约管理子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const bookingConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "我的预约",
    createTitle: "确认预约",
    detailTitle: "预约详情",
    emptyText: "暂无预约记录",
    
    // 预约类型
    typeVenue: "场地预约",
    typeCoach: "教练预约",
    typeCourse: "团课预约",
    
    // 按钮文字
    confirmButton: "确认预约",
    cancelButton: "取消预约",
    payButton: "立即支付",
    
    // 提示文字
    confirmSuccess: "预约成功",
    confirmSuccessDesc: "请按时到场",
    cancelSuccess: "取消成功",
    cancelConfirm: "确定要取消预约吗？",
    cancelWarning: "取消后可能产生违约金",
  },
  
  // ==================== 预约状态 ====================
  status: {
    pending: { label: "待支付", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "已确认", color: "bg-green-100 text-green-800" },
    completed: { label: "已完成", color: "bg-blue-100 text-blue-800" },
    cancelled: { label: "已取消", color: "bg-gray-100 text-gray-800" },
    refunded: { label: "已退款", color: "bg-purple-100 text-purple-800" },
  },
  
  // ==================== 预约规则 ====================
  rules: {
    // 最大同时预约数
    maxActiveBookings: 5,
    // 提前取消时间（小时）
    freeCancelHours: 24,
    // 迟到容忍时间（分钟）
    lateToleranceMinutes: 15,
    // 未到扣分
    noShowPenaltyPoints: 50,
  },
  
  // ==================== 并发控制规则 ====================
  concurrency: {
    // 最小提前预约时间（分钟）
    minAdvanceMinutes: 30,
    // 前端轮询间隔（毫秒）
    pollInterval: 30000,
    // 事务超时时间（毫秒）
    transactionTimeout: 10000,
    // 支付超时时间（分钟）- 超时自动释放
    paymentTimeout: 15,
    // 是否允许同一用户同一时段重复预约同一资源
    allowDuplicateBooking: false,
    // 有效预约状态（占用时段的状态）
    activeStatuses: ["pending", "confirmed"],
  },
  
  // ==================== 时间边界规则 ====================
  timeBoundary: {
    // 是否支持跨天预约
    allowCrossDay: false,
    // 最大提前预约天数
    maxAdvanceDays: 7,
    // 最小预约时长（分钟）
    minDuration: 15,
    // 最大预约时长（分钟）
    maxDuration: 180,
    // 时间粒度（分钟）
    timeGranularity: 15,
  },
  
  // ==================== 错误提示 ====================
  errors: {
    SLOT_CONFLICT: "该时段已被预约，请选择其他时间",
    SLOT_PAST: "该时段已过期，请选择未来时间",
    SLOT_TOO_SOON: "请至少提前{minutes}分钟预约",
    SLOT_OUTSIDE_HOURS: "该时段不在营业时间内",
    MAX_BOOKINGS: "您已有{count}个进行中的预约，请先完成或取消",
    DUPLICATE_BOOKING: "您已预约该时段",
    PAYMENT_TIMEOUT: "支付超时，预约已自动取消",
    CONCURRENT_CONFLICT: "操作冲突，请刷新后重试",
  },
  
  // ==================== 支付配置 ====================
  payment: {
    methods: [
      { key: "wechat", label: "微信支付", icon: "wechat" },
      { key: "alipay", label: "支付宝", icon: "alipay" },
      { key: "balance", label: "余额支付", icon: "wallet" },
      { key: "points", label: "积分抵扣", icon: "gift" },
    ],
    // 积分抵扣比例（100积分=1元）
    pointsRatio: 100,
    // 最大积分抵扣比例
    maxPointsDiscount: 0.5,
  },
  
  // ==================== 列表配置 ====================
  list: {
    pageSize: 10,
    tabs: [
      { key: "all", label: "全部" },
      { key: "pending", label: "待支付" },
      { key: "confirmed", label: "进行中" },
      { key: "completed", label: "已完成" },
    ],
  },
};

export type BookingConfig = typeof bookingConfig;
