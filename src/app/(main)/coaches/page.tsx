"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCoachList, useCoachConfig } from "@/hooks/use-coach";
import { CoachCard, CoachFilter } from "@/components/coach";

/**
 * 教练列表页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function CoachesPage() {
  const config = useCoachConfig();
  const { loading, error, coaches, selectedCategory, onCategoryChange } = useCoachList();

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
      </div>

      {/* 分类筛选 */}
      <div className="px-4 py-3">
        <CoachFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* 教练列表 */}
      <div className="px-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-36 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : coaches.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {config.texts.emptyText}
          </div>
        ) : (
          coaches.map((coach) => (
            <CoachCard
              key={coach.id}
              id={coach.id}
              name={coach.name}
              avatar={coach.avatar}
              title={coach.title}
              specialty={coach.specialty}
              experience={coach.experience}
              rating={coach.rating}
              reviewCount={coach.reviewCount}
              price={coach.price}
              status={coach.status}
            />
          ))
        )}
      </div>
    </div>
  );
}
