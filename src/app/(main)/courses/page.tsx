"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useCourseList, useCourseConfig } from "@/hooks/use-course";
import { CourseCard, CourseFilter } from "@/components/course";

/**
 * 团体课程列表页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function CoursesPage() {
  const config = useCourseConfig();
  const { loading, error, courses, selectedCategory, onCategoryChange } = useCourseList();

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
      </div>

      {/* 分类筛选 */}
      <div className="px-4 py-3">
        <CourseFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* 课程列表 */}
      <div className="px-4 space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            {config.texts.emptyText}
          </div>
        ) : (
          courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              name={course.name}
              image={course.image}
              category={course.category}
              level={course.level}
              coachName={course.coachName}
              startTime={course.startTime}
              duration={course.duration}
              capacity={course.capacity}
              enrolled={course.enrolled}
              price={course.price}
              status={course.status}
            />
          ))
        )}
      </div>
    </div>
  );
}
