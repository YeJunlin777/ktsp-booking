// 环境变量校验
// 在应用启动时检查必要的环境变量

const requiredEnvVars = [
  "DATABASE_URL",
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
] as const;

const optionalEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "APPLE_ID",
  "APPLE_SECRET",
  "SMS_ACCESS_KEY",
  "SMS_SECRET_KEY",
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `缺少必要的环境变量: ${missing.join(", ")}\n请检查 .env 文件配置`
    );
  }

  // 警告可选环境变量
  if (process.env.NODE_ENV === "development") {
    const missingOptional: string[] = [];
    for (const envVar of optionalEnvVars) {
      if (!process.env[envVar]) {
        missingOptional.push(envVar);
      }
    }
    if (missingOptional.length > 0) {
      console.warn(
        `[警告] 以下可选环境变量未配置: ${missingOptional.join(", ")}`
      );
    }
  }
}

// 类型安全的环境变量访问
export const env = {
  // 数据库
  DATABASE_URL: process.env.DATABASE_URL!,
  
  // NextAuth
  NEXTAUTH_URL: process.env.NEXTAUTH_URL!,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
  
  // OAuth（可选）
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  APPLE_ID: process.env.APPLE_ID,
  APPLE_SECRET: process.env.APPLE_SECRET,
  
  // 短信服务（可选）
  SMS_ACCESS_KEY: process.env.SMS_ACCESS_KEY,
  SMS_SECRET_KEY: process.env.SMS_SECRET_KEY,
  
  // 环境
  NODE_ENV: process.env.NODE_ENV || "development",
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
};
