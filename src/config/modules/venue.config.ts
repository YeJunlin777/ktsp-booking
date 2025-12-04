/**
 * 场地预约子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件的配置项，无需改代码
 * - 修改场地类型
 * - 修改时段配置
 * - 修改预约规则
 * - 修改展示文字
 */

export const venueConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "场地预约",
    listTitle: "选择场地",
    emptyText: "暂无可预约场地",
    selectDateText: "选择日期",
    selectTimeText: "选择时段",
    confirmText: "确认预约",
    successText: "预约成功",
    
    // 状态文字
    statusAvailable: "可预约",
    statusBooked: "已约满",
    statusMaintenance: "维护中",
  },
  
  // ==================== 场地类型配置 ====================
  // 不同项目可能有不同的场地类型
  venueTypes: [
    { 
      key: "driving_range", 
      label: "练习场", 
      icon: "/icons/driving-range.svg",
      description: "室外练习场地",
    },
    { 
      key: "simulator", 
      label: "模拟器", 
      icon: "/icons/simulator.svg",
      description: "室内高尔夫模拟器",
    },
    { 
      key: "course", 
      label: "球场", 
      icon: "/icons/course.svg",
      description: "18洞标准球场",
    },
  ],
  
  // ==================== 预约规则 ====================
  rules: {
    // 提前预约天数
    advanceBookingDays: 7,
    // 最小提前时间（小时）
    minAdvanceHours: 2,
    // 每人每天最大预约数
    maxBookingsPerDay: 2,
    // 取消规则：提前多少小时可免费取消
    freeCancelHours: 24,
    // 取消扣费比例
    cancelFeeRatio: 0.3,
    // 是否需要实名认证
    requireRealName: false,
  },
  
  // ==================== 时段配置 ====================
  timeSlots: {
    // 营业时间
    openTime: "06:00",
    closeTime: "22:00",
    // 每个时段时长（分钟）
    slotDuration: 60,
    // 时段间隔（分钟）
    slotGap: 0,
  },
  
  // ==================== 价格展示 ====================
  priceDisplay: {
    unit: "元/小时",
    showOriginalPrice: true,  // 是否显示原价
    showMemberPrice: true,    // 是否显示会员价
  },
};

export type VenueConfig = typeof venueConfig;
