/**
 * 首页模块配置
 * 
 * 【可复用】修改此配置即可适配不同项目
 */

export const homeConfig = {
  // 页面标题
  title: "KTSP高尔夫",
  
  // 场地分类入口
  categories: [
    {
      key: "driving_range",
      label: "打位",
      icon: "target", // lucide icon name
      path: "/venues?type=driving_range",
      color: "bg-green-500",
    },
    {
      key: "simulator",
      label: "模拟器",
      icon: "monitor",
      path: "/venues?type=simulator",
      color: "bg-blue-500",
    },
    {
      key: "putting_green",
      label: "推杆果岭",
      icon: "flag",
      path: "/venues?type=putting_green",
      color: "bg-yellow-500",
    },
    {
      key: "vip_room",
      label: "VIP房",
      icon: "crown",
      path: "/venues?type=vip_room",
      color: "bg-purple-500",
    },
    {
      key: "coach",
      label: "约教练",
      icon: "user-check",
      path: "/coaches",
      color: "bg-orange-500",
    },
    {
      key: "course",
      label: "团体课",
      icon: "users",
      path: "/courses",
      color: "bg-pink-500",
    },
  ],

  // 快捷入口
  quickActions: [
    {
      key: "checkin",
      label: "签到",
      icon: "calendar-check",
      path: "/checkin",
    },
    {
      key: "points",
      label: "积分",
      icon: "coins",
      path: "/points",
    },
    {
      key: "coupon",
      label: "优惠券",
      icon: "ticket",
      path: "/coupons",
    },
    {
      key: "messages",
      label: "消息",
      icon: "bell",
      path: "/messages",
    },
  ],

  // 推荐区块配置
  recommend: {
    title: "为你推荐",
    emptyText: "暂无推荐",
    showHistory: true, // 是否根据历史记录推荐
    defaultCount: 6, // 默认显示数量
  },

  // Banner配置
  banner: {
    autoPlay: true,
    interval: 4000, // 轮播间隔（毫秒）
    showIndicator: true,
  },

  // 文案
  texts: {
    welcome: "欢迎来到KTSP",
    booking: "立即预约",
    viewAll: "查看全部",
    noData: "暂无数据",
  },
};

// 导出类型
export type HomeConfig = typeof homeConfig;
export type CategoryItem = typeof homeConfig.categories[number];
export type QuickActionItem = typeof homeConfig.quickActions[number];
