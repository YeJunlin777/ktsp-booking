/**
 * 优惠券子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const couponConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "优惠券",
    myCoupons: "我的优惠券",
    getCoupons: "领券中心",
    emptyText: "暂无优惠券",
    
    // 按钮文字
    useButton: "立即使用",
    getButton: "立即领取",
    gotButton: "已领取",
    
    // 状态文字
    available: "可使用",
    used: "已使用",
    expired: "已过期",
    
    // 提示文字
    getSuccess: "领取成功",
    getFailed: "领取失败",
    minAmountTip: "满{amount}元可用",
    validDaysTip: "有效期{days}天",
    expireSoonTip: "即将过期",
  },
  
  // ==================== 优惠券类型 ====================
  types: [
    { key: "all", label: "全部" },
    { key: "available", label: "可使用" },
    { key: "used", label: "已使用" },
    { key: "expired", label: "已过期" },
  ],
  
  // ==================== 优惠券样式 ====================
  styles: {
    amount: {
      bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
      textColor: "text-white",
    },
    discount: {
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      textColor: "text-white",
    },
  },
  
  // ==================== 优惠券规则 ====================
  rules: {
    // 每人限领数量
    perUserLimit: 1,
    // 即将过期天数（显示提醒）
    expireSoonDays: 3,
    // 是否显示使用条件
    showCondition: true,
  },
};

export type CouponConfig = typeof couponConfig;
