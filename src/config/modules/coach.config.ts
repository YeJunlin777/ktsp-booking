/**
 * 教练预约子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const coachConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "教练预约",
    listTitle: "选择教练",
    emptyText: "暂无可预约教练",
    detailTitle: "教练详情",
    scheduleTitle: "可预约时段",
    confirmText: "确认预约",
    successText: "预约成功",
    
    // 教练信息标签
    labelSpecialty: "擅长领域",
    labelExperience: "教学经验",
    labelRating: "学员评分",
    labelPrice: "课时费",
  },
  
  // ==================== 教练分类 ====================
  categories: [
    { key: "all", label: "全部" },
    { key: "beginner", label: "入门教学" },
    { key: "advanced", label: "进阶提升" },
    { key: "professional", label: "职业培训" },
  ],
  
  // ==================== 预约规则 ====================
  rules: {
    advanceBookingDays: 7,        // 最多预约未来7天
    minAdvanceHours: 1,           // 默认提前1小时（可在教练设置中覆盖）
    maxBookingsPerDay: 0,         // 0=不限制每日预约次数
    freeCancelHours: 24,          // 默认提前24小时免费取消（可在教练设置中覆盖）
    cancelFeeRatio: 0,            // 暂不收取违约金
    requireRealName: false,
  },
  
  // ==================== 课时配置 ====================
  lessonDuration: {
    default: 60,       // 默认课时（分钟）
    options: [60, 90, 120],  // 可选课时
  },
  
  // ==================== 排班时间配置 ====================
  schedule: {
    startHour: 8,        // 最早可排班时间（8:00）
    endHour: 22,         // 最晚可排班时间（22:00）
    interval: 60,        // 时间间隔（分钟）：60=整点，30=半点
  },
  
  // ==================== 评价配置 ====================
  review: {
    enabled: true,
    minRating: 1,
    maxRating: 5,
    requireComment: false,
    allowImages: true,
    maxImages: 3,
  },
  
  // ==================== 管理后台配置 ====================
  admin: {
    texts: {
      pageTitle: "教练管理",
      addButton: "新增教练",
      scheduleButton: "排班管理",
      searchPlaceholder: "搜索教练姓名，按回车搜索...",
      searchButton: "搜索",
      refreshButton: "刷新",
      listTitle: "教练列表",
      emptyText: "暂无教练数据",
      loadingText: "加载中...",
      // 表头
      tableHeaders: {
        name: "教练",
        title: "职称",
        experience: "教龄",
        rating: "评分",
        lessons: "课时数",
        price: "课时费",
        status: "状态",
        actions: "操作",
      },
      // 状态
      status: {
        active: { label: "在职", color: "bg-green-100 text-green-700" },
        leave: { label: "休假", color: "bg-yellow-100 text-yellow-700" },
      },
      // 操作提示
      createSuccess: "教练创建成功",
      updateSuccess: "教练信息已更新",
      deleteSuccess: "教练已删除",
      // 排班相关
      scheduleSetSuccess: "时间已设置",
      scheduleDeleteSuccess: "时间已删除",
      scheduleCopySuccess: "排班已复制",
      scheduleBatchSuccess: "已设置{count}个时间",
      // 错误提示
      fetchListFailed: "获取教练列表失败",
      fetchScheduleFailed: "获取排班数据失败",
      setScheduleFailed: "设置失败",
      deleteFailed: "删除失败",
      bookedSlotError: "该时间已被预约，无法删除",
    },
  },
};

export type CoachConfig = typeof coachConfig;
