/**
 * 团体课程子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const courseConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "团体课程",
    listTitle: "精选课程",
    detailTitle: "课程详情",
    emptyText: "暂无可报名课程",
    
    // 按钮文字
    enrollButton: "立即报名",
    enrolledButton: "已报名",
    fullButton: "已满员",
    
    // 提示文字
    enrollSuccess: "报名成功",
    enrollSuccessDesc: "请按时参加课程",
    cancelSuccess: "取消报名成功",
    
    // 标签
    labelCoach: "授课教练",
    labelTime: "上课时间",
    labelDuration: "课程时长",
    labelCapacity: "课程人数",
    labelPrice: "课程费用",
    labelLocation: "上课地点",
  },
  
  // ==================== 课程分类 ====================
  categories: [
    { key: "all", label: "全部" },
    { key: "beginner", label: "入门课程" },
    { key: "technique", label: "技术提升" },
    { key: "youth", label: "青少年班" },
    { key: "group", label: "团体活动" },
  ],
  
  // ==================== 课程难度 ====================
  levels: [
    { key: "beginner", label: "入门", color: "bg-green-100 text-green-800" },
    { key: "intermediate", label: "进阶", color: "bg-blue-100 text-blue-800" },
    { key: "advanced", label: "高级", color: "bg-purple-100 text-purple-800" },
  ],
  
  // ==================== 报名规则 ====================
  rules: {
    // 提前报名时间（小时）
    minAdvanceHours: 2,
    // 提前取消时间（小时）
    freeCancelHours: 24,
    // 最小开课人数
    minParticipants: 3,
    // 超时未成班是否自动取消
    autoCancelIfNotFull: true,
  },
  
  // ==================== 课程状态 ====================
  status: {
    upcoming: { label: "即将开课", color: "bg-blue-100 text-blue-800" },
    enrolling: { label: "报名中", color: "bg-green-100 text-green-800" },
    full: { label: "已满员", color: "bg-yellow-100 text-yellow-800" },
    ongoing: { label: "进行中", color: "bg-purple-100 text-purple-800" },
    completed: { label: "已结束", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  },
};

export type CourseConfig = typeof courseConfig;
