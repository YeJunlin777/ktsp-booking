"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Save,
  Clock,
  Gift,
  Calendar,
  Shield,
} from "lucide-react";

/**
 * 系统设置页面
 * 
 * 共享模块
 */
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    // 预约设置
    bookingAdvanceDays: "7",
    bookingCancelHours: "2",
    bookingMinDuration: "30",
    // 积分设置
    pointsPerYuan: "1",
    checkinBasePoints: "10",
    // 推荐设置
    referralInviterPoints: "100",
    referralInviteePoints: "50",
    // 营业时间
    openTime: "08:00",
    closeTime: "22:00",
  });

  const handleSave = async () => {
    // TODO: 调用 API 保存设置
    console.log("保存设置:", settings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">系统设置</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          保存设置
        </Button>
      </div>

      {/* 预约设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            预约设置
          </CardTitle>
          <CardDescription>配置预约相关规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>可提前预约天数</Label>
              <Input
                type="number"
                value={settings.bookingAdvanceDays}
                onChange={(e) => setSettings({ ...settings, bookingAdvanceDays: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">用户可提前多少天预约</p>
            </div>
            <div className="space-y-2">
              <Label>免费取消时限（小时）</Label>
              <Input
                type="number"
                value={settings.bookingCancelHours}
                onChange={(e) => setSettings({ ...settings, bookingCancelHours: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">提前多少小时可免费取消</p>
            </div>
            <div className="space-y-2">
              <Label>最小预约时长（分钟）</Label>
              <Input
                type="number"
                value={settings.bookingMinDuration}
                onChange={(e) => setSettings({ ...settings, bookingMinDuration: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">单次预约最短时间</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 积分设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            积分设置
          </CardTitle>
          <CardDescription>配置积分获取规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>消费积分比例</Label>
              <div className="flex items-center gap-2">
                <span>每消费 ¥1 =</span>
                <Input
                  type="number"
                  className="w-20"
                  value={settings.pointsPerYuan}
                  onChange={(e) => setSettings({ ...settings, pointsPerYuan: e.target.value })}
                />
                <span>积分</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>每日签到积分</Label>
              <Input
                type="number"
                value={settings.checkinBasePoints}
                onChange={(e) => setSettings({ ...settings, checkinBasePoints: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 推荐有礼设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            推荐有礼
          </CardTitle>
          <CardDescription>配置邀请奖励规则</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>邀请人奖励积分</Label>
              <Input
                type="number"
                value={settings.referralInviterPoints}
                onChange={(e) => setSettings({ ...settings, referralInviterPoints: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>被邀请人奖励积分</Label>
              <Input
                type="number"
                value={settings.referralInviteePoints}
                onChange={(e) => setSettings({ ...settings, referralInviteePoints: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 营业时间 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            营业时间
          </CardTitle>
          <CardDescription>配置默认营业时间</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>开始时间</Label>
              <Input
                type="time"
                value={settings.openTime}
                onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间</Label>
              <Input
                type="time"
                value={settings.closeTime}
                onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
