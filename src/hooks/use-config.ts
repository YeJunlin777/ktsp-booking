/**
 * 配置获取 Hooks
 * 
 * 组件中使用配置的统一方式
 */

import { appConfig, venueConfig, coachConfig, pointsConfig, memberConfig, adminConfig } from "@/config";

// 获取应用配置
export function useAppConfig() {
  return appConfig;
}

// 获取场地预约配置
export function useVenueConfig() {
  return venueConfig;
}

// 获取教练预约配置
export function useCoachConfig() {
  return coachConfig;
}

// 获取积分商城配置
export function usePointsConfig() {
  return pointsConfig;
}

// 获取会员配置
export function useMemberConfig() {
  return memberConfig;
}

// 获取管理后台配置
export function useAdminConfig() {
  return adminConfig;
}

// 检查模块是否启用
export function useModuleEnabled(moduleKey: keyof typeof appConfig.modules): boolean {
  return appConfig.modules[moduleKey] ?? false;
}

// 获取底部导航配置（已过滤禁用模块）
export function useBottomNav() {
  const moduleMapping: Record<string, keyof typeof appConfig.modules> = {
    booking: "venue",
    points: "pointsMall",
  };

  return appConfig.bottomNav.filter((item) => {
    const moduleKey = moduleMapping[item.key];
    if (!moduleKey) return true; // 没有关联模块，始终显示
    return appConfig.modules[moduleKey];
  });
}

// 获取快捷入口（已过滤禁用模块）
export function useQuickEntries() {
  return appConfig.home.quickEntries.filter((item) => {
    if (!item.enabled) return false;
    
    const moduleMapping: Record<string, keyof typeof appConfig.modules> = {
      venue: "venue",
      coach: "coach",
      course: "course",
      checkin: "checkin",
    };
    
    const moduleKey = moduleMapping[item.key];
    if (!moduleKey) return true;
    return appConfig.modules[moduleKey];
  });
}

// 获取管理后台菜单（已过滤禁用模块）
export function useAdminMenu() {
  return adminConfig.menuItems.filter((item) => {
    if (item.enabled) return true;
    if (!item.module) return true;
    return appConfig.modules[item.module as keyof typeof appConfig.modules];
  });
}
