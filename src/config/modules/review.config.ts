/**
 * 预约评价子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const reviewConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "评价",
    formTitle: "发表评价",
    listTitle: "用户评价",
    emptyText: "暂无评价",
    
    // 标签
    venueLabel: "场地评分",
    coachLabel: "教练评分",
    commentLabel: "评价内容",
    commentPlaceholder: "分享您的体验，帮助更多用户了解...",
    
    // 按钮
    submitButton: "提交评价",
    submittingButton: "提交中...",
    
    // 提示
    submitSuccess: "评价提交成功",
    submitSuccessDesc: "感谢您的评价",
    alreadyReviewed: "您已评价过此订单",
  },
  
  // ==================== 评分配置 ====================
  rating: {
    max: 5,
    labels: ["很差", "较差", "一般", "满意", "非常满意"],
    colors: ["text-red-500", "text-orange-500", "text-yellow-500", "text-green-500", "text-green-600"],
  },
  
  // ==================== 评价规则 ====================
  rules: {
    // 评价内容最小长度
    minLength: 10,
    // 评价内容最大长度
    maxLength: 500,
    // 评价有效期（天）- 订单完成后多少天内可评价
    validDays: 7,
    // 评价后获得积分
    rewardPoints: 20,
  },
  
  // ==================== 快捷评价标签 ====================
  quickTags: {
    venue: [
      "环境优雅",
      "设施齐全",
      "干净整洁",
      "位置方便",
      "服务周到",
    ],
    coach: [
      "专业耐心",
      "讲解清晰",
      "态度友好",
      "技术过硬",
      "准时守约",
    ],
  },
};

export type ReviewConfig = typeof reviewConfig;
