"use client";

import { useState, useEffect, useMemo } from "react";
import { Clock } from "lucide-react";

interface EnrollCountdownProps {
  deadline: string;
  className?: string;
}

/**
 * 报名截止倒计时组件
 * 
 * 【职责】显示距离报名截止的倒计时
 * 【配置化】时间格式可配置
 */
export function EnrollCountdown({ deadline, className }: EnrollCountdownProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeLeft = useMemo(() => {
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) {
      return null; // 已截止
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, diff };
  }, [deadline, now]);

  if (!timeLeft) {
    return (
      <span className={`text-red-500 text-xs ${className || ""}`}>
        报名已截止
      </span>
    );
  }

  // 小于24小时显示红色警告
  const isUrgent = timeLeft.diff < 24 * 60 * 60 * 1000;

  const formatTime = () => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}天${timeLeft.hours}小时`;
    }
    if (timeLeft.hours > 0) {
      return `${timeLeft.hours}小时${timeLeft.minutes}分`;
    }
    return `${timeLeft.minutes}分${timeLeft.seconds}秒`;
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs ${
        isUrgent ? "text-red-500" : "text-amber-600"
      } ${className || ""}`}
    >
      <Clock className="w-3 h-3" />
      <span>报名截止：{formatTime()}</span>
    </span>
  );
}
