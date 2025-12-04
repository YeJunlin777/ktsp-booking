"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * 积分获取规则项
 */
export interface EarnRuleItem {
  key: string;
  label: string;
  points: string;
  icon?: string;
}

/**
 * 积分规则卡片 Props
 */
export interface EarnRulesCardProps {
  /** 规则列表 */
  rules: EarnRuleItem[];
  /** 卡片标题 */
  title?: string;
  /** 自定义类名 */
  className?: string;
}

/**
 * 积分规则卡片
 * 
 * 【职责】展示积分获取方式
 * 【复用】通过props传入规则配置
 */
export function EarnRulesCard({
  rules,
  title = "积分获取方式",
  className,
}: EarnRulesCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.key}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <span className="text-sm">{rule.label}</span>
              <span className="text-sm font-medium text-primary">
                {rule.points}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
