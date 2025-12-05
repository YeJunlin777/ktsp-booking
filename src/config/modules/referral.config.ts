/**
 * 推荐有礼子系统配置
 * 
 * 【复用说明】
 * 新项目只需修改此文件，无需改代码
 */

export const referralConfig = {
  // ==================== 页面文字 ====================
  texts: {
    pageTitle: "推荐有礼",
    inviteTitle: "邀请好友",
    inviteSubtitle: "邀请好友注册，双方都能获得积分奖励",
    
    // 邀请码
    codeLabel: "我的邀请码",
    copyButton: "复制邀请码",
    copySuccess: "复制成功",
    
    // 分享
    shareTitle: "分享给好友",
    shareDesc: "邀请好友一起来玩高尔夫！",
    
    // 记录
    recordTitle: "邀请记录",
    emptyText: "暂无邀请记录",
    
    // 状态
    pending: "待激活",
    completed: "已完成",
  },
  
  // ==================== 奖励规则 ====================
  rewards: {
    // 邀请人奖励积分
    inviterPoints: 100,
    // 被邀请人奖励积分
    inviteePoints: 50,
    // 邀请人额外奖励（被邀请人首次消费后）
    inviterBonusPoints: 200,
    // 最大邀请人数（0=无限）
    maxInvites: 0,
  },
  
  // ==================== 规则说明 ====================
  rules: [
    "邀请好友注册并绑定手机号，您可获得 100 积分",
    "被邀请好友可获得 50 积分新人礼",
    "好友首次消费后，您可额外获得 200 积分",
    "积分可在积分商城兑换商品或抵扣消费",
  ],
  
  // ==================== 分享渠道 ====================
  shareChannels: [
    { key: "wechat", label: "微信", icon: "MessageCircle" },
    { key: "poster", label: "海报", icon: "Image" },
    { key: "link", label: "链接", icon: "Link" },
  ],
};

export type ReferralConfig = typeof referralConfig;
