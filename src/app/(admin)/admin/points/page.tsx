"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Save,
  Gift,
  Calendar,
  ShoppingBag,
  Users,
} from "lucide-react";

/**
 * 积分规则设置页面
 * 
 * 开发者 B 负责
 */
export default function AdminPointsPage() {
  const [rules, setRules] = useState({
    // 签到规则
    checkinBase: "10",
    checkinStreak7: "50",
    checkinStreak30: "200",
    // 消费积分
    consumeRatio: "1",
    // 邀请积分
    inviteInviter: "100",
    inviteInvitee: "50",
    // 任务积分
    taskFirstBooking: "100",
    taskFirstReview: "50",
    taskShareDaily: "10",
    // 过期设置
    expireDays: "365",
  });

  const handleSave = async () => {
    // TODO: 调用 API 保存设置
    console.log("保存积分规则:", rules);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">积分规则</h1>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          保存规则
        </Button>
      </div>

      {/* 签到规则 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            签到规则
          </CardTitle>
          <CardDescription>配置每日签到积分奖励</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>每日签到基础积分</Label>
              <Input
                type="number"
                value={rules.checkinBase}
                onChange={(e) => setRules({ ...rules, checkinBase: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>连续7天额外奖励</Label>
              <Input
                type="number"
                value={rules.checkinStreak7}
                onChange={(e) => setRules({ ...rules, checkinStreak7: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>连续30天额外奖励</Label>
              <Input
                type="number"
                value={rules.checkinStreak30}
                onChange={(e) => setRules({ ...rules, checkinStreak30: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 消费积分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            消费积分
          </CardTitle>
          <CardDescription>配置消费返积分规则</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>消费积分比例</Label>
            <div className="flex items-center gap-2">
              <span>每消费 ¥1 获得</span>
              <Input
                type="number"
                className="w-20"
                value={rules.consumeRatio}
                onChange={(e) => setRules({ ...rules, consumeRatio: e.target.value })}
              />
              <span>积分</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 邀请积分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            邀请奖励
          </CardTitle>
          <CardDescription>配置推荐有礼积分奖励</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>邀请人获得积分</Label>
              <Input
                type="number"
                value={rules.inviteInviter}
                onChange={(e) => setRules({ ...rules, inviteInviter: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">好友完成首次预约后发放</p>
            </div>
            <div className="space-y-2">
              <Label>被邀请人获得积分</Label>
              <Input
                type="number"
                value={rules.inviteInvitee}
                onChange={(e) => setRules({ ...rules, inviteInvitee: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">注册后立即发放</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 任务积分 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            任务奖励
          </CardTitle>
          <CardDescription>配置积分任务奖励</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>首次预约</Label>
              <Input
                type="number"
                value={rules.taskFirstBooking}
                onChange={(e) => setRules({ ...rules, taskFirstBooking: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>首次评价</Label>
              <Input
                type="number"
                value={rules.taskFirstReview}
                onChange={(e) => setRules({ ...rules, taskFirstReview: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>每日分享</Label>
              <Input
                type="number"
                value={rules.taskShareDaily}
                onChange={(e) => setRules({ ...rules, taskShareDaily: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 过期设置 */}
      <Card>
        <CardHeader>
          <CardTitle>积分有效期</CardTitle>
          <CardDescription>配置积分过期规则</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>积分有效期（天）</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-32"
                value={rules.expireDays}
                onChange={(e) => setRules({ ...rules, expireDays: e.target.value })}
              />
              <span className="text-muted-foreground">天后过期（0 表示永不过期）</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
