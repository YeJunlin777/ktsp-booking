"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useVenueList, useVenueConfig } from "@/hooks/use-venue";
import { VenueCard, VenueTypeFilter } from "@/components/venue";

/**
 * 场地列表页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function VenuesPage() {
  const config = useVenueConfig();
  const { loading, error, venues, selectedType, onTypeChange } = useVenueList();

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
      </div>

      {/* 类型筛选 */}
      <div className="px-4 py-3">
        <VenueTypeFilter
          selectedType={selectedType}
          onTypeChange={onTypeChange}
        />
      </div>

      {/* 场地列表 */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : venues.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {config.texts.emptyText}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                id={venue.id}
                name={venue.name}
                type={venue.type}
                image={venue.image}
                price={venue.price}
                peakPrice={venue.peakPrice}
                status={venue.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
