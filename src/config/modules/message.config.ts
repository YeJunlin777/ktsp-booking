/**
 * 消息中心子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const messageConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "消息中心",
    emptyText: "暂无消息",
    markAllRead: "全部已读",
    deleteAll: "清空消息",
    
    // 时间显示
    justNow: "刚刚",
    minutesAgo: "{n}分钟前",
    hoursAgo: "{n}小时前",
    daysAgo: "{n}天前",
  },
  
  // ==================== 消息类型 ====================
  types: [
    { key: "all", label: "全部", icon: "Bell" },
    { key: "system", label: "系统通知", icon: "Settings" },
    { key: "booking", label: "预约提醒", icon: "Calendar" },
    { key: "activity", label: "活动通知", icon: "Gift" },
    { key: "invite", label: "邀请通知", icon: "UserPlus" },
  ],
  
  // ==================== 消息图标颜色 ====================
  iconColors: {
    system: "bg-blue-100 text-blue-600",
    booking: "bg-green-100 text-green-600",
    activity: "bg-orange-100 text-orange-600",
    invite: "bg-purple-100 text-purple-600",
  },
  
  // ==================== 消息规则 ====================
  rules: {
    // 消息保留天数
    retentionDays: 30,
    // 每页显示数量
    pageSize: 20,
    // 是否显示未读角标
    showBadge: true,
    // 最大角标数字
    maxBadgeCount: 99,
  },
};

export type MessageConfig = typeof messageConfig;
