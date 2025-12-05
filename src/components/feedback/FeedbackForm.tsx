"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, AlertCircle, Bug, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 反馈类型配置
 */
export interface FeedbackTypeOption {
  key: string;
  label: string;
  icon: string;
}

/**
 * 反馈表单 Props
 */
export interface FeedbackFormProps {
  /** 反馈类型列表 */
  types: FeedbackTypeOption[];
  /** 内容占位符 */
  contentPlaceholder: string;
  /** 最小长度 */
  minLength: number;
  /** 最大长度 */
  maxLength: number;
  /** 提交按钮文字 */
  submitText: string;
  /** 提交中文字 */
  submittingText: string;
  /** 是否正在提交 */
  submitting: boolean;
  /** 提交回调 */
  onSubmit: (type: string, content: string) => Promise<boolean>;
  /** 自定义类名 */
  className?: string;
}

// 图标映射
const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  AlertCircle,
  Bug,
};

/**
 * 反馈表单组件
 */
export function FeedbackForm({
  types,
  contentPlaceholder,
  minLength,
  maxLength,
  submitText,
  submittingText,
  submitting,
  onSubmit,
  className,
}: FeedbackFormProps) {
  const [selectedType, setSelectedType] = useState<string>("");
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!selectedType || content.length < minLength) return;
    
    const success = await onSubmit(selectedType, content);
    if (success) {
      setSelectedType("");
      setContent("");
    }
  };

  const isValid = selectedType && content.length >= minLength;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">提交反馈</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 反馈类型选择 */}
        <div className="space-y-2">
          <Label>反馈类型</Label>
          <div className="grid grid-cols-3 gap-2">
            {types.map((type) => {
              const Icon = iconMap[type.icon] || Lightbulb;
              const isSelected = selectedType === type.key;
              
              return (
                <button
                  key={type.key}
                  type="button"
                  onClick={() => setSelectedType(type.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 反馈内容 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>反馈内容</Label>
            <span className="text-xs text-muted-foreground">
              {content.length}/{maxLength}
            </span>
          </div>
          <Textarea
            placeholder={contentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, maxLength))}
            rows={5}
            className="resize-none"
          />
          {content.length > 0 && content.length < minLength && (
            <p className="text-xs text-destructive">
              至少输入{minLength}个字
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <Button
          className="w-full"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? submittingText : submitText}
        </Button>
      </CardContent>
    </Card>
  );
}
