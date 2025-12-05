"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { PointsBalance, ProductCard, CategoryFilter } from "@/components/points";
import { useProductList, useRedeemProduct, usePointsConfig } from "@/hooks/use-points";
import { useUserInfo } from "@/hooks/use-member";

/**
 * 积分商城页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function PointsPage() {
  const config = usePointsConfig();
  const { user } = useUserInfo();
  const { loading, error, products, selectedCategory, onCategoryChange, refresh } = useProductList();
  const { redeeming, redeemProduct } = useRedeemProduct();

  // 用户积分（开发模式使用模拟值）
  const userPoints = user?.points ?? 1500;

  // 兑换商品
  const handleRedeem = async (productId: string) => {
    const result = await redeemProduct(productId);
    if (result) {
      refresh(); // 刷新商品列表
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 积分余额 */}
      <div className="px-4 pt-4">
        <PointsBalance points={userPoints} />
      </div>

      {/* 页面标题 */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold">{config.texts.mallTitle}</h2>
      </div>

      {/* 分类筛选 */}
      <div className="px-4 pb-3">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
        />
      </div>

      {/* 商品列表 */}
      <div className="px-4">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            暂无商品
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image}
                points={product.points}
                originalPoints={product.originalPoints}
                stock={product.stock}
                category={product.category}
                userPoints={userPoints}
                onRedeem={redeeming ? undefined : handleRedeem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
