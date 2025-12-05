"use client";

import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAvailableCoupons, useClaimCoupon, useCouponConfig } from "@/hooks/use-coupon";

/**
 * 领券中心页面
 * 
 * 【职责】展示可领取的优惠券
 */
export default function CouponCenterPage() {
  const router = useRouter();
  const config = useCouponConfig();
  const { loading, error, templates, refresh } = useAvailableCoupons();
  const { claiming, claimCoupon } = useClaimCoupon();

  // 领取优惠券
  const handleClaim = async (templateId: string) => {
    const result = await claimCoupon(templateId);
    if (result) {
      refresh();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 顶栏 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="font-semibold">{config.texts.getCoupons}</h1>
        </div>
      </div>

      {/* 优惠券列表 */}
      <div className="px-4 py-4 space-y-4">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : templates.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无可领取的优惠券</p>
          </div>
        ) : (
          templates.map((tpl) => (
            <Card key={tpl.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 金额/折扣 */}
                    <div className={cn(
                      "w-16 h-16 rounded-lg flex flex-col items-center justify-center",
                      tpl.type === "amount" 
                        ? "bg-gradient-to-r from-red-500 to-orange-500 text-white"
                        : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    )}>
                      {tpl.type === "amount" ? (
                        <>
                          <span className="text-xs">¥</span>
                          <span className="text-xl font-bold">{tpl.value}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-xl font-bold">{tpl.value}</span>
                          <span className="text-xs">折</span>
                        </>
                      )}
                    </div>

                    {/* 信息 */}
                    <div>
                      <h3 className="font-medium">{tpl.name}</h3>
                      {tpl.minAmount && tpl.minAmount > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {config.texts.minAmountTip.replace("{amount}", String(tpl.minAmount))}
                        </p>
                      )}
                      {tpl.remaining !== null && (
                        <p className="text-xs text-muted-foreground mt-1">
                          剩余 {tpl.remaining} 张
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 领取按钮 */}
                  <Button
                    variant={tpl.claimed ? "outline" : "default"}
                    size="sm"
                    disabled={tpl.claimed || claiming}
                    onClick={() => handleClaim(tpl.id)}
                  >
                    {tpl.claimed ? config.texts.gotButton : config.texts.getButton}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
