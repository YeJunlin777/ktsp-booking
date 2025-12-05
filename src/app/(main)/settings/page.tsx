"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Bell, Shield, FileText, Info, LogOut } from "lucide-react";

const settingItems = [
  {
    key: "notifications",
    label: "消息通知",
    icon: Bell,
    type: "switch",
  },
  {
    key: "privacy",
    label: "隐私设置",
    icon: Shield,
    type: "link",
    href: "/settings/privacy",
  },
  {
    key: "agreement",
    label: "用户协议",
    icon: FileText,
    type: "link",
    href: "/settings/agreement",
  },
  {
    key: "about",
    label: "关于我们",
    icon: Info,
    type: "link",
    href: "/settings/about",
  },
];

/**
 * 设置页面
 */
export default function SettingsPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* 页面标题 */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur px-4 py-3 border-b">
        <h1 className="text-lg font-semibold">设置</h1>
      </div>

      {/* 设置列表 */}
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-0 divide-y">
            {settingItems.map((item) => {
              const Icon = item.icon;
              
              if (item.type === "switch") {
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span>{item.label}</span>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-5 h-5 accent-primary"
                    />
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.key}
                  href={item.href || "#"}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* 退出登录 */}
        <Card>
          <CardContent className="p-0">
            <button className="flex items-center justify-center gap-2 w-full p-4 text-destructive">
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </CardContent>
        </Card>

        {/* 版本信息 */}
        <p className="text-center text-sm text-muted-foreground">
          版本 1.0.0
        </p>
      </div>
    </div>
  );
}
