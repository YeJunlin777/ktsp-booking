/**
 * 管理后台配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const adminConfig = {
  // ==================== 基础信息 ====================
  title: "KTSP管理后台",
  logo: "/images/admin-logo.png",
  
  // ==================== 侧边栏菜单 ====================
  // 根据 modules 配置自动显示/隐藏
  menuItems: [
    { 
      key: "dashboard", 
      label: "控制台", 
      icon: "LayoutDashboard", 
      href: "/admin",
      enabled: true,
    },
    { 
      key: "venues", 
      label: "场地管理", 
      icon: "MapPin", 
      href: "/admin/venues",
      module: "venue",  // 关联的功能模块
    },
    { 
      key: "bookings", 
      label: "预约管理", 
      icon: "CalendarDays", 
      href: "/admin/bookings",
      enabled: true,
    },
    { 
      key: "coaches", 
      label: "教练管理", 
      icon: "UserCog", 
      href: "/admin/coaches",
      module: "coach",
    },
    { 
      key: "courses", 
      label: "课程管理", 
      icon: "GraduationCap", 
      href: "/admin/courses",
      module: "course",
    },
    { 
      key: "members", 
      label: "会员管理", 
      icon: "Users", 
      href: "/admin/members",
      enabled: true,
    },
    { 
      key: "points", 
      label: "积分规则", 
      icon: "Gift", 
      href: "/admin/points",
      module: "pointsMall",
    },
    { 
      key: "products", 
      label: "积分商城", 
      icon: "ShoppingBag", 
      href: "/admin/products",
      module: "pointsMall",
    },
    { 
      key: "coupons", 
      label: "优惠券", 
      icon: "Ticket", 
      href: "/admin/coupons",
      module: "adminCoupon",
    },
    { 
      key: "banners", 
      label: "轮播图", 
      icon: "Image", 
      href: "/admin/banners",
      enabled: true,
    },
    { 
      key: "messages", 
      label: "消息推送", 
      icon: "Bell", 
      href: "/admin/messages",
      module: "adminMessage",
    },
    { 
      key: "stats", 
      label: "数据统计", 
      icon: "BarChart3", 
      href: "/admin/stats",
      module: "adminStats",
    },
    { 
      key: "settings", 
      label: "系统设置", 
      icon: "Settings", 
      href: "/admin/settings",
      enabled: true,
    },
  ],
  
  // ==================== 管理员角色 ====================
  roles: [
    { 
      key: "super_admin", 
      label: "超级管理员", 
      permissions: ["*"],
    },
    { 
      key: "admin", 
      label: "管理员", 
      permissions: ["venues", "bookings", "coaches", "members", "products"],
    },
    { 
      key: "staff", 
      label: "员工", 
      permissions: ["bookings", "members"],
    },
  ],
  
  // ==================== 控制台卡片 ====================
  dashboardCards: [
    { key: "todayBookings", label: "今日预约", icon: "CalendarDays", color: "blue" },
    { key: "todayRevenue", label: "今日营收", icon: "DollarSign", color: "green" },
    { key: "totalMembers", label: "会员总数", icon: "Users", color: "purple" },
    { key: "pendingOrders", label: "待处理订单", icon: "Clock", color: "orange" },
  ],
};

export type AdminConfig = typeof adminConfig;
