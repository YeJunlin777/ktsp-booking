/**
 * 意见反馈子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const feedbackConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "意见反馈",
    historyTitle: "我的反馈",
    
    typePlaceholder: "请选择反馈类型",
    contentPlaceholder: "请详细描述您的问题或建议...",
    
    submitButton: "提交反馈",
    submitting: "提交中...",
    submitSuccess: "反馈提交成功",
    submitSuccessDesc: "感谢您的反馈，我们会尽快处理",
    
    noFeedback: "暂无反馈记录",
    
    statusPending: "待处理",
    statusProcessing: "处理中",
    statusResolved: "已解决",
  },
  
  // ==================== 反馈类型 ====================
  types: [
    { key: "suggestion", label: "功能建议", icon: "Lightbulb" },
    { key: "complaint", label: "投诉反馈", icon: "AlertCircle" },
    { key: "bug", label: "问题报告", icon: "Bug" },
  ],
  
  // ==================== 表单规则 ====================
  rules: {
    contentMinLength: 10,
    contentMaxLength: 500,
    maxImages: 3,
    maxImageSize: 5 * 1024 * 1024, // 5MB
  },
  
  // ==================== 状态配置 ====================
  statusColors: {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  },
};

export type FeedbackConfig = typeof feedbackConfig;
