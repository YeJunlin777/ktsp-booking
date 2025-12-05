"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Phone, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

/**
 * 用户登录页面
 * 
 * 支持：手机号+验证码、Apple、Google 登录
 * 开发模式下可使用测试账号快速登录
 */
export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [formData, setFormData] = useState({
    phone: "",
    code: "",
  });
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const handleSendCode = async () => {
    if (!formData.phone || formData.phone.length !== 11) {
      toast.error("请输入正确的手机号");
      return;
    }

    try {
      setLoading(true);
      // TODO: 调用发送验证码 API
      // await post("/api/auth/send-code", { phone: formData.phone });
      
      // 模拟发送成功
      toast.success("验证码已发送（开发模式：123456）");
      setStep("code");
      
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      toast.error("发送验证码失败");
    } finally {
      setLoading(false);
    }
  };

  // 验证码登录
  const handleLogin = async () => {
    if (!formData.code) {
      toast.error("请输入验证码");
      return;
    }

    try {
      setLoading(true);
      // TODO: 调用登录 API
      // const result = await post("/api/auth/login", formData);
      
      // 开发模式：验证码 123456 直接通过
      if (formData.code === "123456") {
        toast.success("登录成功");
        router.push("/");
        router.refresh();
      } else {
        toast.error("验证码错误");
      }
    } catch {
      toast.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  // 测试账号快速登录
  const handleTestLogin = async () => {
    try {
      setLoading(true);
      // 模拟登录测试账号
      toast.success("测试账号登录成功");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("登录失败");
    } finally {
      setLoading(false);
    }
  };

  // 第三方登录（占位）
  const handleOAuthLogin = (provider: "apple" | "google") => {
    toast.info(`${provider === "apple" ? "Apple" : "Google"} 登录功能开发中`);
    // TODO: 实现 NextAuth 第三方登录
    // signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* 顶部导航 */}
      <div className="flex items-center gap-4 p-4">
        <Link href="/" className="flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-lg font-medium">登录</span>
      </div>

      {/* 登录卡片 */}
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
              K
            </div>
            <CardTitle className="text-2xl">欢迎回来</CardTitle>
            <CardDescription>登录 KTSP 高尔夫预订系统</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 手机号登录 */}
            {step === "phone" ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-10"
                      maxLength={11}
                    />
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={handleSendCode}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  获取验证码
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入验证码"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      maxLength={6}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className="shrink-0"
                    >
                      {countdown > 0 ? `${countdown}s` : "重新发送"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    验证码已发送至 {formData.phone}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setStep("phone")}
                    className="flex-1"
                  >
                    返回
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={handleLogin}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    登录
                  </Button>
                </div>
              </div>
            )}

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                其他登录方式
              </span>
            </div>

            {/* 第三方登录 */}
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => handleOAuthLogin("apple")}
                className="gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleOAuthLogin("google")}
                className="gap-2"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>

            {/* 开发模式：测试账号 */}
            <div className="rounded-lg bg-muted p-4">
              <p className="mb-2 text-center text-sm font-medium">开发测试</p>
              <Button 
                variant="secondary" 
                className="w-full"
                onClick={handleTestLogin}
                disabled={loading}
              >
                使用测试账号登录
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                手机号：13800138000 / 验证码：123456
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
