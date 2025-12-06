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
    expiredButton: "报名已截止",
    
    // 提示文字
    enrollSuccess: "报名成功",
    enrollSuccessDesc: "请按时参加课程",
    cancelSuccess: "取消报名成功",
    enrolledTip: "您已成功报名此课程",
    cancelTip: "开课前 {hours} 小时可免费取消报名",
    
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
   
  },
  
  // ==================== 课程状态 ====================
  status: {
    pending: { label: "待开课", color: "bg-blue-100 text-blue-800" },
    enrolling: { label: "报名中", color: "bg-green-100 text-green-800" },
    full: { label: "已满员", color: "bg-yellow-100 text-yellow-800" },
    ongoing: { label: "进行中", color: "bg-purple-100 text-purple-800" },
    ended: { label: "已结束", color: "bg-gray-100 text-gray-800" },
    cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  },
  
  // ==================== 管理后台配置 ====================
  admin: {
    texts: {
      pageTitle: "课程管理",
      addButton: "新增课程",
      editButton: "编辑",
      deleteButton: "删除",
      studentsButton: "报名学员",
      searchPlaceholder: "搜索课程名称或教练...",
      allStatus: "全部状态",
      searchButton: "搜索",
      refreshButton: "刷新",
      listTitle: "课程列表",
      emptyText: "暂无课程数据",
      loadingText: "加载中...",
      // 表头
      tableHeaders: {
        name: "课程名称",
        category: "分类",
        coach: "教练",
        lessons: "课时",
        enrollment: "报名/名额",
        price: "价格",
        startDate: "开课日期",
        status: "状态",
        actions: "操作",
      },
      // 操作提示
      createSuccess: "课程创建成功",
      updateSuccess: "课程信息已更新",
      deleteSuccess: "课程已删除",
      deleteConfirm: "确定要删除此课程吗？此操作不可撤销。",
      deleteTitle: "删除课程",
      studentRemoved: "学员已移除",
      deleteFailed: "删除失败，该课程可能有报名记录",
      fetchListFailed: "获取课程列表失败",
      fetchStudentsFailed: "获取学员列表失败",
      removeStudentConfirm: "确定要移除此学员吗？",
    },
  },
};

export type CourseConfig = typeof courseConfig;
