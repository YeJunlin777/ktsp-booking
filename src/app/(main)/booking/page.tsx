"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, UserCog, Users, CalendarDays } from "lucide-react";

// 预约入口配置
const bookingEntries = [
  {
    key: "venue",
    title: "场地预约",
    description: "打位、模拟器、推杆果岭、VIP房",
    icon: MapPin,
    href: "/venues",
    color: "bg-green-500",
  },
  {
    key: "coach",
    title: "教练预约",
    description: "专业教练一对一指导",
    icon: UserCog,
    href: "/coaches",
    color: "bg-blue-500",
  },
  {
    key: "course",
    title: "团体课程",
    description: "报名参加团体课程",
    icon: Users,
    href: "/courses",
    color: "bg-purple-500",
  },
  {
    key: "my",
    title: "我的预约",
    description: "查看预约记录和订单",
    icon: CalendarDays,
    href: "/bookings",
    color: "bg-orange-500",
  },
];

/**
 * 预约入口页面
 * 
 * 【职责】展示预约入口选项
 */
export default function BookingPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">预约服务</h1>
      </div>

      {/* 预约入口 */}
      <div className="p-4 space-y-4">
        {bookingEntries.map((entry) => {
          const Icon = entry.icon;
          return (
            <Link key={entry.key} href={entry.href}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      entry.color
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
