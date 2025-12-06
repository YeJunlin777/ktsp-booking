/**
 * 通用文案配置
 * 
 * 【复用说明】
 * 包含跨模块共用的文案，如错误提示、加载状态等
 */
export const commonConfig = {
  // ==================== 通用状态文案 ====================
  status: {
    loading: "加载中...",
    submitting: "提交中...",
    saving: "保存中...",
    deleting: "删除中...",
  },

  // ==================== 通用错误提示 ====================
  errors: {
    loadFailed: "加载失败，请刷新重试",
    submitFailed: "提交失败，请重试",
    saveFailed: "保存失败，请重试",
    deleteFailed: "删除失败，请重试",
    operationFailed: "操作失败，请重试",
    networkError: "网络错误，请检查网络连接",
    unknownError: "发生未知错误",
  },

  // ==================== 通用成功提示 ====================
  success: {
    saved: "保存成功",
    deleted: "删除成功",
    submitted: "提交成功",
    copied: "已复制",
  },

  // ==================== 通用按钮文案 ====================
  buttons: {
    confirm: "确认",
    cancel: "取消",
    save: "保存",
    delete: "删除",
    edit: "编辑",
    add: "新增",
    search: "搜索",
    refresh: "刷新",
    submit: "提交",
    back: "返回",
    close: "关闭",
    more: "更多",
  },

  // ==================== 通用空状态 ====================
  empty: {
    default: "暂无数据",
    list: "列表为空",
    search: "未找到相关结果",
  },

  // ==================== 登录相关 ====================
  login: {
    // 用户端登录
    user: {
      pageTitle: "登录",
      phonePlaceholder: "请输入手机号",
      codePlaceholder: "请输入验证码",
      sendCode: "获取验证码",
      resendCode: "重新获取",
      loginButton: "登录",
      testLogin: "测试账号登录",
      // 提示
      invalidPhone: "请输入正确的手机号",
      codeSent: "验证码已发送",
      codeSentDev: "验证码已发送（开发模式：123456）",
      sendCodeFailed: "发送验证码失败",
      enterCode: "请输入验证码",
      loginSuccess: "登录成功",
      codeError: "验证码错误",
      loginFailed: "登录失败",
      testLoginSuccess: "测试账号登录成功",
    },
    // 管理后台登录
    admin: {
      pageTitle: "管理后台登录",
      usernamePlaceholder: "请输入账号",
      passwordPlaceholder: "请输入密码",
      loginButton: "登录",
      // 提示
      enterCredentials: "请输入账号和密码",
      loginSuccess: "登录成功",
      loginFailed: "账号或密码错误",
    },
  },
};

export type CommonConfig = typeof commonConfig;
