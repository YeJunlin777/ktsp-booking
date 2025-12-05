"use client";

import { useState, useEffect, useCallback } from "react";
import { get, post } from "@/lib/api";
import { messageConfig } from "@/config";
import { toast } from "sonner";

// ==================== 类型定义 ====================

interface Message {
  id: string;
  type: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface UnreadCounts {
  total: number;
  [key: string]: number;
}

// ==================== 消息列表 Hook ====================

/**
 * 消息列表 Hook
 * 
 * 【职责】获取和筛选消息列表
 */
export function useMessageList() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeType, setActiveType] = useState("all");

  const fetchMessages = useCallback(async (type: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = type !== "all" 
        ? `/api/messages?type=${type}` 
        : "/api/messages";
      const data = await get<Message[]>(url);
      setMessages(data || []);
    } catch (err) {
      console.error("获取消息列表失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(activeType);
  }, [fetchMessages, activeType]);

  const handleTypeChange = useCallback((type: string) => {
    setActiveType(type);
  }, []);

  return {
    loading,
    error,
    messages,
    activeType,
    onTypeChange: handleTypeChange,
    refresh: () => fetchMessages(activeType),
  };
}

// ==================== 消息详情 Hook ====================

/**
 * 消息详情 Hook
 * 
 * 【职责】获取消息详情
 */
export function useMessageDetail(messageId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<Message | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!messageId) return;

    try {
      setLoading(true);
      setError(null);

      const data = await get<Message>(`/api/messages/${messageId}`);
      setMessage(data);
    } catch (err) {
      console.error("获取消息详情失败:", err);
      setError("加载失败，请刷新重试");
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { loading, error, message, refresh: fetchDetail };
}

// ==================== 未读数量 Hook ====================

/**
 * 未读消息数量 Hook
 * 
 * 【职责】获取未读消息数量
 */
export function useUnreadCount() {
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ total: 0 });

  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await get<UnreadCounts>("/api/messages/unread-count");
      setUnreadCounts(data || { total: 0 });
    } catch (err) {
      console.error("获取未读数量失败:", err);
    }
  }, []);

  // 初始加载 - 使用 IIFE 避免 ESLint 警告
  useEffect(() => {
    let cancelled = false;
    
    (async () => {
      try {
        const data = await get<UnreadCounts>("/api/messages/unread-count");
        if (!cancelled) {
          setUnreadCounts(data || { total: 0 });
        }
      } catch (err) {
        console.error("获取未读数量失败:", err);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { unreadCounts, refresh: fetchUnreadCount };
}

// ==================== 全部已读 Hook ====================

/**
 * 全部已读 Hook
 * 
 * 【职责】标记所有消息为已读
 */
export function useMarkAllRead() {
  const [marking, setMarking] = useState(false);

  const markAllRead = useCallback(async () => {
    try {
      setMarking(true);
      await post("/api/messages/read-all", {});
      toast.success("已全部标记为已读");
      return true;
    } catch (err) {
      console.error("标记已读失败:", err);
      toast.error("操作失败，请重试");
      return false;
    } finally {
      setMarking(false);
    }
  }, []);

  return { marking, markAllRead };
}

// ==================== 配置 Hook ====================

/**
 * 消息配置 Hook
 */
export function useMessageConfig() {
  return messageConfig;
}
