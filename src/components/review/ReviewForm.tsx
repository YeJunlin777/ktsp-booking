"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import { reviewConfig } from "@/config";

interface ReviewFormProps {
  showVenueRating?: boolean;
  showCoachRating?: boolean;
  submitting?: boolean;
  onSubmit: (data: {
    venueRating?: number;
    coachRating?: number;
    venueComment?: string;
    coachComment?: string;
  }) => Promise<boolean>;
  className?: string;
}

/**
 * 评价表单组件
 * 
 * 【职责】收集评价信息
 * 【配置化】标签和规则从配置读取
 */
export function ReviewForm({
  showVenueRating = true,
  showCoachRating = false,
  submitting = false,
  onSubmit,
  className,
}: ReviewFormProps) {
  const [venueRating, setVenueRating] = useState(0);
  const [coachRating, setCoachRating] = useState(0);
  const [venueComment, setVenueComment] = useState("");
  const [coachComment, setCoachComment] = useState("");
  const [selectedVenueTags, setSelectedVenueTags] = useState<string[]>([]);
  const [selectedCoachTags, setSelectedCoachTags] = useState<string[]>([]);

  const { texts, rules, quickTags } = reviewConfig;

  // 切换标签
  const toggleTag = (tag: string, type: "venue" | "coach") => {
    if (type === "venue") {
      setSelectedVenueTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    } else {
      setSelectedCoachTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      );
    }
  };

  // 提交
  const handleSubmit = async () => {
    const data: {
      venueRating?: number;
      coachRating?: number;
      venueComment?: string;
      coachComment?: string;
    } = {};

    if (showVenueRating && venueRating > 0) {
      data.venueRating = venueRating;
      data.venueComment = selectedVenueTags.length > 0 
        ? `${selectedVenueTags.join("、")}${venueComment ? "。" + venueComment : ""}`
        : venueComment;
    }

    if (showCoachRating && coachRating > 0) {
      data.coachRating = coachRating;
      data.coachComment = selectedCoachTags.length > 0 
        ? `${selectedCoachTags.join("、")}${coachComment ? "。" + coachComment : ""}`
        : coachComment;
    }

    const success = await onSubmit(data);
    if (success) {
      // 重置表单
      setVenueRating(0);
      setCoachRating(0);
      setVenueComment("");
      setCoachComment("");
      setSelectedVenueTags([]);
      setSelectedCoachTags([]);
    }
  };

  // 验证是否可提交
  const isValid = (showVenueRating && venueRating > 0) || (showCoachRating && coachRating > 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{texts.formTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 场地评分 */}
        {showVenueRating && (
          <div className="space-y-3">
            <Label>{texts.venueLabel}</Label>
            <StarRating value={venueRating} onChange={setVenueRating} size="lg" />
            
            {/* 快捷标签 */}
            <div className="flex flex-wrap gap-2">
              {quickTags.venue.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, "venue")}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm border transition-colors",
                    selectedVenueTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 评价内容 */}
            <Textarea
              placeholder={texts.commentPlaceholder}
              value={venueComment}
              onChange={(e) => setVenueComment(e.target.value.slice(0, rules.maxLength))}
              rows={3}
              className="resize-none"
            />
            <div className="text-right text-xs text-muted-foreground">
              {venueComment.length}/{rules.maxLength}
            </div>
          </div>
        )}

        {/* 教练评分 */}
        {showCoachRating && (
          <div className="space-y-3">
            <Label>{texts.coachLabel}</Label>
            <StarRating value={coachRating} onChange={setCoachRating} size="lg" />
            
            {/* 快捷标签 */}
            <div className="flex flex-wrap gap-2">
              {quickTags.coach.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag, "coach")}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm border transition-colors",
                    selectedCoachTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* 评价内容 */}
            <Textarea
              placeholder={texts.commentPlaceholder}
              value={coachComment}
              onChange={(e) => setCoachComment(e.target.value.slice(0, rules.maxLength))}
              rows={3}
              className="resize-none"
            />
            <div className="text-right text-xs text-muted-foreground">
              {coachComment.length}/{rules.maxLength}
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <Button
          className="w-full"
          disabled={!isValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? texts.submittingButton : texts.submitButton}
        </Button>

        {/* 积分提示 */}
        <p className="text-xs text-center text-muted-foreground">
          提交评价可获得 {rules.rewardPoints} 积分
        </p>
      </CardContent>
    </Card>
  );
}
