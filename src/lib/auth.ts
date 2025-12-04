import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  
  providers: [
    // 手机号+验证码登录
    CredentialsProvider({
      id: "phone",
      name: "Phone",
      credentials: {
        phone: { label: "手机号", type: "text" },
        code: { label: "验证码", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.code) {
          throw new Error("请输入手机号和验证码");
        }

        // TODO: 验证短信验证码
        // const isValid = await verifySmsCode(credentials.phone, credentials.code);
        // if (!isValid) throw new Error("验证码错误或已过期");

        // 查找或创建用户
        let user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        if (!user) {
          // 新用户注册
          user = await prisma.user.create({
            data: {
              phone: credentials.phone,
              nickname: `用户${credentials.phone.slice(-4)}`,
            },
          });
        }

        return {
          id: user.id,
          phone: user.phone || undefined,
          name: user.nickname,
          email: user.email,
          image: user.avatar,
        };
      },
    }),

    // Google登录
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // Apple登录
    ...(process.env.APPLE_ID && process.env.APPLE_SECRET
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID,
            clientSecret: process.env.APPLE_SECRET,
          }),
        ]
      : []),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.phone = token.phone as string;
      }
      return session;
    },

    async signIn({ user, account }) {
      // 第三方登录时，关联或创建用户
      if (account?.provider === "google" || account?.provider === "apple") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              nickname: user.name || `用户${Date.now().toString().slice(-6)}`,
              avatar: user.image,
            },
          });
        }
      }
      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  debug: process.env.NODE_ENV === "development",
};

// 密码加密
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// 密码验证
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
