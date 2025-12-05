"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useHome } from "@/hooks/use-home";
import {
  BannerCarousel,
  CategoryNav,
  QuickActions,
  RecommendList,
} from "@/components/home";

/**
 * 首页
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function HomePage() {
  const { loading, error, banners, recommendVenues } = useHome();

  // 加载状态
  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[50vh]">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 轮播Banner */}
      <div className="px-4 pt-4">
        <BannerCarousel banners={banners} />
      </div>

      {/* 场地分类入口 */}
      <div className="px-4 mt-4">
        <CategoryNav />
      </div>

      {/* 快捷入口 */}
      <div className="px-4 mt-4 bg-card rounded-xl mx-4">
        <QuickActions />
      </div>

      {/* 推荐场地 */}
      <div className="px-4 mt-6">
        <RecommendList venues={recommendVenues} />
      </div>
    </div>
  );
}
