"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { CouponCard, CouponTabs, CouponEmpty } from "@/components/coupon";
import { useCouponList, useCouponConfig } from "@/hooks/use-coupon";

/**
 * 我的优惠券页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function CouponsPage() {
  const router = useRouter();
  const config = useCouponConfig();
  const { loading, error, coupons, activeType, counts, onTypeChange } = useCouponList();

  // 使用优惠券 - 跳转到预约页面
  const handleUseCoupon = (couponId: string) => {
    // 将优惠券ID存储到 sessionStorage，预约时使用
    sessionStorage.setItem("selectedCouponId", couponId);
    router.push("/venues");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b flex justify-between items-center">
        <h1 className="text-lg font-semibold">{config.texts.myCoupons}</h1>
        <button
          onClick={() => router.push("/coupons/center")}
          className="text-sm text-primary"
        >
          领券中心
        </button>
      </div>

      {/* 状态筛选 */}
      <div className="px-4 py-3">
        <CouponTabs
          activeType={activeType}
          onTypeChange={onTypeChange}
          counts={counts}
        />
      </div>

      {/* 优惠券列表 */}
      <div className="px-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : coupons.length === 0 ? (
          <CouponEmpty />
        ) : (
          coupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              id={coupon.id}
              name={coupon.name}
              type={coupon.type}
              value={coupon.value}
              minAmount={coupon.minAmount}
              status={coupon.status as "unused" | "used" | "expired"}
              expireAt={coupon.expireAt}
              onUse={handleUseCoupon}
            />
          ))
        )}
      </div>
    </div>
  );
}
