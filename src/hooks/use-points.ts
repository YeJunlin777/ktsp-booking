"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { pointsConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface Product {
  id: string;
  name: string;
  image?: string | null;
  points: number;
  originalPoints?: number | null;
  stock: number;
  category: string;
  description?: string | null;
}

interface PointsRecord {
  id: string;
  type: "earn" | "spend";
  amount: number;
  description: string;
  createdAt: string;
}

// ==================== 商品列表 Hook ====================

/**
 * 积分商品列表 Hook
 * 
 * 【职责】获取和筛选积分商品
 */
export function useProductList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = useCallback(async (category: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = category !== "all" 
        ? `/api/products?category=${category}` 
        : "/api/products";
      const data = await get<Product[]>(url);
      setProducts(data || []);
    } catch (err) {
      console.error("获取商品列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [fetchProducts, selectedCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  return {
    loading,
    error,
    products,
    selectedCategory,
    onCategoryChange: handleCategoryChange,
    refresh: () => fetchProducts(selectedCategory),
  };
}

// ==================== 兑换商品 Hook ====================

/**
 * 兑换商品 Hook
 * 
 * 【职责】处理商品兑换
 */
export function useRedeemProduct() {
  const [redeeming, setRedeeming] = useState(false);

  const redeemProduct = useCallback(async (productId: string) => {
    try {
      setRedeeming(true);

      const result = await post<{ orderId: string; message: string }>(
        `/api/products/${productId}/redeem`,
        {}
      );
      
      toast.success(pointsConfig.texts.redeemSuccess);

      return result;
    } catch (err) {
      console.error("兑换商品失败:", err);
      toast.error("兑换失败，请重试");
      return null;
    } finally {
      setRedeeming(false);
    }
  }, []);

  return { redeeming, redeemProduct };
}

// ==================== 积分历史 Hook ====================

/**
 * 积分历史 Hook
 * 
 * 【职责】获取积分变动记录
 */
export function usePointsHistory() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<PointsRecord[]>([]);

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await get<PointsRecord[]>("/api/points/history");
      setRecords(data || []);
    } catch (err) {
      console.error("获取积分记录失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { loading, error, records, refresh: fetchRecords };
}

// ==================== 配置 Hook ====================

/**
 * 积分配置 Hook
 */
export function usePointsConfig() {
  return pointsConfig;
}
