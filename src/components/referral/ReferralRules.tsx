"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { referralConfig } from "@/config";

interface ReferralRulesProps {
  className?: string;
}

/**
 * 推荐规则说明组件
 * 
 * 【职责】展示推荐规则
 * 【配置化】规则列表从配置读取
 */
export function ReferralRules({ className }: ReferralRulesProps) {
  const { rules } = referralConfig;

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">活动规则</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {rules.map((rule, index) => (
          <div key={index} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{rule}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
