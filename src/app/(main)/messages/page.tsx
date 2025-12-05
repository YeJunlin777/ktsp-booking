"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { MessageCard, MessageTabs, MessageEmpty } from "@/components/message";
import { 
  useMessageList, 
  useUnreadCount, 
  useMarkAllRead, 
  useMessageConfig 
} from "@/hooks/use-message";

/**
 * 消息中心页面
 * 
 * 【职责】只负责布局和组合组件
 * 【组件化】所有UI拆分到独立组件
 * 【配置化】所有配置从配置文件读取
 */
export default function MessagesPage() {
  const config = useMessageConfig();
  const { loading, error, messages, activeType, onTypeChange, refresh } = useMessageList();
  const { unreadCounts, refresh: refreshUnread } = useUnreadCount();
  const { marking, markAllRead } = useMarkAllRead();

  // 全部已读
  const handleMarkAllRead = async () => {
    const success = await markAllRead();
    if (success) {
      refresh();
      refreshUnread();
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">{config.texts.pageTitle}</h1>
          {unreadCounts.total > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              disabled={marking}
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              {config.texts.markAllRead}
            </Button>
          )}
        </div>
      </div>

      {/* 类型标签 */}
      <div className="px-4 py-3">
        <MessageTabs
          activeType={activeType}
          onTypeChange={onTypeChange}
          unreadCounts={unreadCounts}
        />
      </div>

      {/* 消息列表 */}
      <div className="px-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </>
        ) : error ? (
          <div className="py-20 text-center text-destructive">{error}</div>
        ) : messages.length === 0 ? (
          <MessageEmpty />
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              id={message.id}
              type={message.type}
              title={message.title}
              content={message.content}
              isRead={message.isRead}
              createdAt={message.createdAt}
            />
          ))
        )}
      </div>
    </div>
  );
}
