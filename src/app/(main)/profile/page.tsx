"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { UserCard, MenuList, StatsCard } from "@/components/member";
import { useUserInfo, useUserStats, useMemberConfig } from "@/hooks/use-member";

/**
 * 个人中心页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function ProfilePage() {
  const router = useRouter();
  const config = useMemberConfig();
  const { loading: userLoading, user } = useUserInfo();
  const { loading: statsLoading, stats } = useUserStats();

  // 统计数据项
  const statsItems = stats ? [
    { label: "预约", value: stats.bookings, href: "/bookings" },
    { label: "待完成", value: stats.pending, href: "/bookings?status=confirmed" },
    { label: "积分", value: stats.points, href: "/points" },
    { label: "优惠券", value: stats.coupons, href: "/coupons" },
  ] : [];

  // 编辑资料
  const handleEditProfile = () => {
    router.push("/profile/edit");
  };

  // 退出登录
  const handleLogout = () => {
    // TODO: 实现退出登录逻辑
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* 用户信息卡片 */}
      <div className="px-4 pt-4">
        {userLoading ? (
          <Skeleton className="h-48 w-full rounded-lg" />
        ) : user ? (
          <UserCard
            name={user.name || "用户"}
            phone={user.phone}
            avatar={user.avatar}
            level={user.level}
            points={user.points}
            onEditClick={handleEditProfile}
          />
        ) : (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-4">请先登录</p>
            <Button onClick={() => router.push("/login")}>去登录</Button>
          </div>
        )}
      </div>

      {/* 统计数据 */}
      {user && (
        <div className="px-4 mt-4">
          {statsLoading ? (
            <Skeleton className="h-20 w-full rounded-lg" />
          ) : (
            <StatsCard items={statsItems} />
          )}
        </div>
      )}

      {/* 功能菜单 */}
      {user && (
        <div className="px-4 mt-4">
          <MenuList />
        </div>
      )}

      {/* 退出登录 */}
      {user && (
        <div className="px-4 mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {config.texts.logout}
          </Button>
        </div>
      )}
    </div>
  );
}
