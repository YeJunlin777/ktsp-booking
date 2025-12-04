/**
 * 积分商城子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const pointsConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "积分商城",
    mallTitle: "积分兑换",
    checkinTitle: "每日签到",
    taskTitle: "积分任务",
    historyTitle: "积分明细",
    
    checkinSuccess: "签到成功",
    checkinAlready: "今日已签到",
    redeemSuccess: "兑换成功",
    redeemConfirm: "确认使用 {points} 积分兑换？",
    
    pointsUnit: "积分",
    stockText: "库存: {stock}",
    soldOutText: "已兑完",
  },
  
  // ==================== 签到规则 ====================
  checkin: {
    enabled: true,
    // 基础积分
    basePoints: 10,
    // 连续签到奖励
    streakBonus: [
      { days: 3, points: 20, label: "连续3天" },
      { days: 7, points: 50, label: "连续7天" },
      { days: 15, points: 100, label: "连续15天" },
      { days: 30, points: 200, label: "连续30天" },
    ],
    // 是否显示日历
    showCalendar: true,
  },
  
  // ==================== 积分获取规则 ====================
  earnRules: [
    { key: "checkin", label: "每日签到", points: "+10~200", icon: "CalendarCheck" },
    { key: "booking", label: "预约消费", points: "消费1元=1积分", icon: "ShoppingBag" },
    { key: "invite", label: "邀请好友", points: "+100/人", icon: "UserPlus" },
    { key: "review", label: "发表评价", points: "+20", icon: "MessageSquare" },
    { key: "profile", label: "完善资料", points: "+50", icon: "User" },
  ],
  
  // ==================== 积分任务 ====================
  tasks: {
    enabled: true,
    items: [
      { key: "daily_checkin", label: "每日签到", points: 10, type: "daily" },
      { key: "first_booking", label: "首次预约", points: 100, type: "once" },
      { key: "complete_profile", label: "完善个人资料", points: 50, type: "once" },
      { key: "first_review", label: "首次评价", points: 30, type: "once" },
      { key: "invite_friend", label: "邀请好友注册", points: 100, type: "repeat" },
    ],
  },
  
  // ==================== 商品分类 ====================
  productCategories: [
    { key: "all", label: "全部" },
    { key: "voucher", label: "优惠券" },
    { key: "gift", label: "礼品" },
    { key: "service", label: "服务" },
  ],
  
  // ==================== 积分过期规则 ====================
  expiration: {
    enabled: true,
    // 积分有效期（月）
    validMonths: 12,
    // 过期提醒（天）
    reminderDays: 30,
  },
};

export type PointsConfig = typeof pointsConfig;
