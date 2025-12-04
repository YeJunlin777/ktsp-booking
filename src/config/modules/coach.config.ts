/**
 * 教练预约子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const coachConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "教练预约",
    listTitle: "选择教练",
    emptyText: "暂无可预约教练",
    detailTitle: "教练详情",
    scheduleTitle: "可预约时段",
    confirmText: "确认预约",
    successText: "预约成功",
    
    // 教练信息标签
    labelSpecialty: "擅长领域",
    labelExperience: "教学经验",
    labelRating: "学员评分",
    labelPrice: "课时费",
  },
  
  // ==================== 教练分类 ====================
  categories: [
    { key: "all", label: "全部" },
    { key: "beginner", label: "入门教学" },
    { key: "advanced", label: "进阶提升" },
    { key: "professional", label: "职业培训" },
  ],
  
  // ==================== 预约规则 ====================
  rules: {
    advanceBookingDays: 14,
    minAdvanceHours: 4,
    maxBookingsPerDay: 1,
    freeCancelHours: 48,
    cancelFeeRatio: 0.5,
    requireRealName: false,
  },
  
  // ==================== 课时配置 ====================
  lessonDuration: {
    default: 60,       // 默认课时（分钟）
    options: [60, 90, 120],  // 可选课时
  },
  
  // ==================== 评价配置 ====================
  review: {
    enabled: true,
    minRating: 1,
    maxRating: 5,
    requireComment: false,
    allowImages: true,
    maxImages: 3,
  },
};

export type CoachConfig = typeof coachConfig;
