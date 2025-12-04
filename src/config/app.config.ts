/**
 * 应用主配置文件
 * 
 * 【设计原则】
 * 后续新项目只需修改此配置文件，无需改代码
 * 所有文字、图片、颜色、功能开关都从配置读取
 */

export const appConfig = {
  // ==================== 基础信息 ====================
  name: "KTSP高尔夫",
  shortName: "KTSP",
  description: "KTSP高尔夫球场预订系统",
  logo: "/images/logo.png",
  favicon: "/favicon.ico",
  
  // ==================== 主题配置 ====================
  theme: {
    primaryColor: "#10b981",  // 主色调
    accentColor: "#059669",   // 强调色
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
  },
  
  // ==================== 功能模块开关 ====================
  // 只需要改这里就能控制显示哪些功能
  modules: {
    // 用户端功能
    venue: true,           // 场地预约
    coach: true,           // 教练预约
    course: true,          // 团体课程
    checkin: true,         // 签到打卡
    pointsMall: true,      // 积分商城
    invite: true,          // 推荐有礼
    realNameAuth: true,    // 实名认证
    feedback: true,        // 意见反馈
    
    // 登录方式
    phoneLogin: true,      // 手机号登录
    appleLogin: true,      // Apple登录
    googleLogin: true,     // Google登录
    wechatLogin: false,    // 微信登录（预留）
    
    // 支付方式（预留）
    alipay: false,
    wechatPay: false,
    applePay: false,
    
    // 管理后台功能
    adminStats: true,      // 数据统计
    adminCoupon: true,     // 优惠券管理
    adminMessage: true,    // 消息推送
  },
  
  // ==================== 底部导航配置 ====================
  bottomNav: [
    { key: "home", label: "首页", icon: "Home", href: "/" },
    { key: "booking", label: "预约", icon: "CalendarDays", href: "/booking" },
    { key: "points", label: "积分", icon: "Gift", href: "/points" },
    { key: "profile", label: "我的", icon: "User", href: "/profile" },
  ],
  
  // ==================== 首页配置 ====================
  home: {
    // 快捷入口
    quickEntries: [
      { key: "venue", label: "场地预约", icon: "MapPin", href: "/booking/venue", enabled: true },
      { key: "coach", label: "教练预约", icon: "UserCog", href: "/booking/coach", enabled: true },
      { key: "course", label: "团体课程", icon: "Users", href: "/booking/course", enabled: true },
      { key: "checkin", label: "每日签到", icon: "CalendarCheck", href: "/checkin", enabled: true },
    ],
  },
  
  // ==================== 联系方式 ====================
  contact: {
    phone: "400-xxx-xxxx",
    email: "service@ktsp.com",
    address: "xxx市xxx区xxx路xxx号",
    workingHours: "09:00 - 22:00",
  },
  
  // ==================== 协议链接 ====================
  agreements: {
    userAgreement: "/agreements/user",
    privacyPolicy: "/agreements/privacy",
  },
};

export type AppConfig = typeof appConfig;
