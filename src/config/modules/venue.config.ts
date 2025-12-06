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
    selectDateText: "📅 想哪天来？",
    selectDurationText: "⏱️ 想打多久？",
    selectTimeText: "🕐 选择时间段",
    confirmText: "确认预约",
    successText: "预约成功",
    
    // 状态文字
    statusAvailable: "可选",
    statusBooked: "已满",
    statusMaintenance: "维护中",
    statusConflict: "冲突",
    
    // 提示文字
    recommendTip: "推荐",
    saveTip: "省",
    conflictTip: "与已有预约冲突",
    selectTimeTip: "请选择时间段",
  },
  
  // ==================== 场地类型配置 ====================
  // 不同项目可能有不同的场地类型
  venueTypes: [
    { 
      key: "driving_range", 
      label: "打位", 
      icon: "target",
      color: "bg-green-500",
      description: "室内外练习打位",
    },
    { 
      key: "simulator", 
      label: "模拟器室", 
      icon: "monitor",
      color: "bg-blue-500",
      description: "高端高尔夫模拟器",
    },
    { 
      key: "putting_green", 
      label: "推杆果岭", 
      icon: "flag",
      color: "bg-yellow-500",
      description: "室内推杆练习区",
    },
    { 
      key: "vip_room", 
      label: "VIP房", 
      icon: "crown",
      color: "bg-purple-500",
      description: "私密VIP包房",
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
    // 最小时段粒度（分钟）- 用于冲突检测
    minSlotUnit: 15,
  },
  
  // ==================== 时长选项 ====================
  // 用户可选的预约时长（支持15/30/60分钟）
  durationOptions: [
    { 
      minutes: 15, 
      label: "15分钟", 
      shortLabel: "15分钟",
      priceRatio: 0.25,  // 相对于1小时的价格比例
      discount: 0,
    },
    { 
      minutes: 30, 
      label: "30分钟", 
      shortLabel: "30分钟",
      priceRatio: 0.5,
      discount: 0,
    },
    { 
      minutes: 60, 
      label: "60分钟", 
      shortLabel: "60分钟",
      priceRatio: 1,
      discount: 0,
      recommended: true,  // 推荐选项
    },
  ],
  
  // ==================== 价格展示 ====================
  priceDisplay: {
    unit: "元",
    hourUnit: "元/小时",
    showOriginalPrice: true,
    showMemberPrice: true,
    showDiscount: true,
  },
  
  // ==================== 预约须知 ====================
  bookingTips: [
    "请提前10分钟到场签到",
    "开始前2小时可免费取消",
    "迟到15分钟视为自动放弃",
    "请穿着合适的运动服装",
  ],
  
  // ==================== 管理后台配置 ====================
  admin: {
    texts: {
      pageTitle: "场地管理",
      addButton: "新增场地",
      searchPlaceholder: "搜索场地名称...",
      searchButton: "搜索",
      refreshButton: "刷新",
      listTitle: "场地列表",
      emptyText: "暂无场地数据",
      loadingText: "加载中...",
      // 表头
      tableHeaders: {
        name: "场地名称",
        type: "类型",
        capacity: "容量",
        price: "价格",
        status: "状态",
        actions: "操作",
      },
      // 状态
      status: {
        available: { label: "可用", color: "bg-green-100 text-green-700" },
        maintenance: { label: "维护中", color: "bg-yellow-100 text-yellow-700" },
        closed: { label: "已关闭", color: "bg-red-100 text-red-700" },
      },
      // 操作提示
      createSuccess: "场地创建成功",
      updateSuccess: "场地信息已更新",
      deleteSuccess: "场地已删除",
      deleteFailed: "删除失败",
    },
  },
};

export type VenueConfig = typeof venueConfig;
