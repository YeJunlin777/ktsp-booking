"use client";

import { useState, useEffect, useCallback } from "react";
import { get } from "@/lib/api";
import { homeConfig } from "@/config";

interface Banner {
  id: string;
  title?: string;
  image: string;
  link?: string;
}

interface RecommendVenue {
  id: string;
  name: string;
  type: string;
  image?: string;
  price: number;
  status: string;
}

interface HomeData {
  banners: Banner[];
  recommendVenues: RecommendVenue[];
}

/**
 * 首页数据 Hook
 * 
 * 【职责】获取首页所需的所有数据
 * 【复用】可在任何需要首页数据的地方使用
 */
export function useHome() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<HomeData>({
    banners: [],
    recommendVenues: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchHomeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 并行请求
      const [banners, recommendVenues] = await Promise.all([
        get<Banner[]>("/api/home/banners"),
        get<RecommendVenue[]>("/api/home/recommend"),
      ]);

      setData({
        banners: banners || [],
        recommendVenues: recommendVenues || [],
      });
    } catch (err) {
      console.error("获取首页数据失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return {
    loading,
    error,
    banners: data.banners,
    recommendVenues: data.recommendVenues,
    refresh,
  };
}

/**
 * 首页配置 Hook
 * 
 * 【职责】提供首页配置的便捷访问
 */
export function useHomeConfig() {
  return homeConfig;
}
