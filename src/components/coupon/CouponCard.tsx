"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { couponConfig } from "@/config";

interface CouponCardProps {
  id: string;
  name: string;
  type: "amount" | "discount";
  value: number;
  minAmount?: number | null;
  status: "unused" | "used" | "expired";
  expireAt: string;
  onUse?: (id: string) => void;
  className?: string;
}

/**
 * 优惠券卡片组件
 * 
 * 【职责】展示单张优惠券
 * 【配置化】样式和文字从配置读取
 */
export function CouponCard({
  id,
  name,
  type,
  value,
  minAmount,
  status,
  expireAt,
  onUse,
  className,
}: CouponCardProps) {
  const style = couponConfig.styles[type];
  const isAvailable = status === "unused";
  
  // 检查是否即将过期
  const expireDate = new Date(expireAt);
  const now = new Date();
  const daysLeft = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpireSoon = isAvailable && daysLeft <= couponConfig.rules.expireSoonDays && daysLeft > 0;

  // 格式化过期时间
  const formatExpire = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getDate().toString().padStart(2, "0")}`;
  };

  // 获取状态文字
  const getStatusText = () => {
    if (status === "used") return couponConfig.texts.used;
    if (status === "expired") return couponConfig.texts.expired;
    return "";
  };

  return (
    <div className={cn(
      "flex rounded-lg overflow-hidden shadow-sm border",
      !isAvailable && "opacity-60",
      className
    )}>
      {/* 左侧 - 金额/折扣 */}
      <div className={cn(
        "w-24 flex flex-col items-center justify-center py-4 relative",
        style.bgColor,
        style.textColor
      )}>
        {type === "amount" ? (
          <>
            <span className="text-sm">¥</span>
            <span className="text-3xl font-bold">{value}</span>
          </>
        ) : (
          <>
            <span className="text-3xl font-bold">{value}</span>
            <span className="text-sm">折</span>
          </>
        )}
        {/* 锯齿边缘效果 */}
        <div className="absolute right-0 top-0 bottom-0 w-2">
          <div className="h-full flex flex-col justify-around">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-background" />
            ))}
          </div>
        </div>
      </div>

      {/* 右侧 - 信息 */}
      <div className="flex-1 p-3 flex flex-col justify-between bg-card">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{name}</h3>
            {isExpireSoon && (
              <span className="text-xs text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                {couponConfig.texts.expireSoonTip}
              </span>
            )}
          </div>
          {minAmount && minAmount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {couponConfig.texts.minAmountTip.replace("{amount}", String(minAmount))}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-muted-foreground">
            {formatExpire(expireAt)} 到期
          </span>
          {isAvailable ? (
            <Button size="sm" onClick={() => onUse?.(id)}>
              {couponConfig.texts.useButton}
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">
              {getStatusText()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
