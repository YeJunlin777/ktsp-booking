/**
 * 会员系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const memberConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "个人中心",
    editProfile: "编辑资料",
    myBookings: "我的预约",
    myPoints: "我的积分",
    myOrders: "兑换记录",
    myMessages: "消息中心",
    settings: "设置",
    logout: "退出登录",
    
    verifyTitle: "实名认证",
    verifyTip: "完成实名认证后可享受更多权益",
  },
  
  // ==================== 会员等级配置 ====================
  levels: [
    { 
      level: 1, 
      name: "普通会员", 
      minPoints: 0, 
      discount: 1, 
      icon: "/icons/level-1.svg",
      color: "#9ca3af",
      benefits: ["基础预约服务"],
    },
    { 
      level: 2, 
      name: "银卡会员", 
      minPoints: 1000, 
      discount: 0.95,
      icon: "/icons/level-2.svg",
      color: "#94a3b8",
      benefits: ["95折优惠", "优先预约"],
    },
    { 
      level: 3, 
      name: "金卡会员", 
      minPoints: 5000, 
      discount: 0.9,
      icon: "/icons/level-3.svg",
      color: "#fbbf24",
      benefits: ["9折优惠", "优先预约", "专属客服"],
    },
    { 
      level: 4, 
      name: "钻石会员", 
      minPoints: 20000, 
      discount: 0.85,
      icon: "/icons/level-4.svg",
      color: "#60a5fa",
      benefits: ["85折优惠", "优先预约", "专属客服", "免费停车"],
    },
  ],
  
  // ==================== 个人中心菜单 ====================
  menuItems: [
    { key: "bookings", label: "我的预约", icon: "CalendarDays", href: "/bookings" },
    { key: "points", label: "我的积分", icon: "Gift", href: "/points/history" },
    { key: "orders", label: "兑换记录", icon: "ShoppingBag", href: "/orders" },
    { key: "coupons", label: "我的优惠券", icon: "Ticket", href: "/coupons" },
    { key: "messages", label: "消息中心", icon: "Bell", href: "/messages" },
    { key: "invite", label: "邀请好友", icon: "UserPlus", href: "/invite" },
    { key: "feedback", label: "意见反馈", icon: "MessageSquare", href: "/feedback" },
    { key: "settings", label: "设置", icon: "Settings", href: "/settings" },
  ],
  
  // ==================== 实名认证配置 ====================
  realNameAuth: {
    enabled: true,
    required: false,  // 是否强制要求
    // 需要上传的证件
    documents: [
      { key: "idCardFront", label: "身份证正面", required: true },
      { key: "idCardBack", label: "身份证背面", required: true },
    ],
    // 认证后权益
    benefits: ["预约球场", "参加比赛"],
  },
  
  // ==================== 邀请有礼配置 ====================
  invite: {
    enabled: true,
    // 邀请人奖励
    inviterReward: { points: 100, coupon: null },
    // 被邀请人奖励
    inviteeReward: { points: 50, coupon: null },
    // 分享文案
    shareText: "我在{appName}预约高尔夫，体验超棒！邀请你一起来~",
  },
};

export type MemberConfig = typeof memberConfig;
