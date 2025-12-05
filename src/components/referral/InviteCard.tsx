"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift } from "lucide-react";
import { referralConfig } from "@/config";
import { toast } from "sonner";

interface InviteCardProps {
  inviteCode: string;
  inviteCount?: number;
  totalPoints?: number;
  className?: string;
}

/**
 * 邀请卡片组件
 * 
 * 【职责】展示邀请码和奖励信息
 * 【配置化】文字和奖励规则从配置读取
 */
export function InviteCard({
  inviteCode,
  inviteCount = 0,
  totalPoints = 0,
  className,
}: InviteCardProps) {
  const [copied, setCopied] = useState(false);
  const { texts, rewards } = referralConfig;

  // 复制邀请码
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success(texts.copySuccess);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("复制失败");
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* 头部背景 */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="w-8 h-8" />
          <div>
            <h2 className="text-lg font-bold">{texts.inviteTitle}</h2>
            <p className="text-sm opacity-90">{texts.inviteSubtitle}</p>
          </div>
        </div>

        {/* 邀请码 */}
        <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
          <p className="text-xs opacity-80 mb-1">{texts.codeLabel}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-mono font-bold tracking-wider">
              {inviteCode}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="bg-white/30 hover:bg-white/40"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {texts.copyButton}
            </Button>
          </div>
        </div>
      </div>

      {/* 统计信息 */}
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{inviteCount}</p>
            <p className="text-xs text-muted-foreground">邀请人数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{totalPoints}</p>
            <p className="text-xs text-muted-foreground">获得积分</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">
              +{rewards.inviterPoints}
            </p>
            <p className="text-xs text-muted-foreground">每邀请1人</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
