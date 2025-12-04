// 生成订单号
export function generateOrderNo(prefix = "ORD"): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const timeStr = date.getTime().toString().slice(-6);
  const random = Math.random().toString(36).slice(-4).toUpperCase();
  return `${prefix}${dateStr}${timeStr}${random}`;
}

// 生成邀请码
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 去掉容易混淆的字符
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 生成随机验证码
export function generateVerifyCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += Math.floor(Math.random() * 10);
  }
  return code;
}

// 格式化日期
export function formatDate(date: Date | string, format = "YYYY-MM-DD"): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

// 格式化金额（分转元）
export function formatPrice(price: number | string, decimals = 2): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return num.toFixed(decimals);
}

// 手机号脱敏
export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + "****" + phone.slice(-4);
}

// 身份证号脱敏
export function maskIdCard(idCard: string): string {
  if (!idCard || idCard.length < 10) return idCard;
  return idCard.slice(0, 6) + "********" + idCard.slice(-4);
}

// 计算两个日期之间的天数
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

// 判断是否是同一天
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// 获取今天的开始时间
export function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

// 获取今天的结束时间
export function getTodayEnd(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

// 延迟函数
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 深拷贝
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 去除对象中的空值
export function removeEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== "") {
      result[key] = obj[key];
    }
  }
  return result;
}
