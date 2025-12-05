/**
 * 数据库种子文件
 * 
 * 运行：npx prisma db seed
 */

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// 解析 DATABASE_URL
const databaseUrl = new URL(process.env.DATABASE_URL || "mysql://root:@localhost:3306/ktsp_booking");

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: parseInt(databaseUrl.port) || 3306,
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.slice(1), // 去掉开头的 /
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 开始播种数据库...");

  // ========== 1. 创建管理员 ==========
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: "$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u", // 123456
      name: "超级管理员",
      role: "super_admin",
      status: "active",
    },
  });
  console.log("✅ 管理员:", admin.username);

  // ========== 2. 创建场地 ==========
  const venues = await Promise.all([
    prisma.venue.upsert({
      where: { id: "venue_driving_01" },
      update: { images: ["https://placehold.co/400x300/22c55e/white?text=A01"] },
      create: {
        id: "venue_driving_01",
        name: "打位 A01",
        type: "driving_range",
        description: "一楼靠窗位置，视野开阔",
        images: ["https://placehold.co/400x300/22c55e/white?text=A01"],
        price: 100,
        peakPrice: 150,
        facilities: ["空调", "WiFi", "储物柜"],
        status: "active",
        sortOrder: 1,
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue_driving_02" },
      update: { images: ["https://placehold.co/400x300/22c55e/white?text=A02"] },
      create: {
        id: "venue_driving_02",
        name: "打位 A02",
        type: "driving_range",
        description: "一楼中间位置",
        images: ["https://placehold.co/400x300/22c55e/white?text=A02"],
        price: 100,
        peakPrice: 150,
        facilities: ["空调", "WiFi"],
        status: "active",
        sortOrder: 2,
      },
    }),
    prisma.venue.upsert({
      where: { id: "venue_simulator_01" },
      update: { images: ["https://placehold.co/400x300/3b82f6/white?text=S01"] },
      create: {
        id: "venue_simulator_01",
        name: "模拟器室 S01",
        type: "simulator",
        description: "配备 TrackMan 高端模拟器",
        images: ["https://placehold.co/400x300/3b82f6/white?text=S01"],
        price: 200,
        peakPrice: 300,
        facilities: ["空调", "WiFi", "沙发", "投影"],
        status: "active",
        sortOrder: 10,
      },
    }),
  ]);
  console.log("✅ 场地:", venues.length, "个");

  // ========== 3. 创建教练 ==========
  const coaches = await Promise.all([
    prisma.coach.upsert({
      where: { id: "coach_01" },
      update: { avatar: "https://placehold.co/200x200/6366f1/white?text=Coach1" },
      create: {
        id: "coach_01",
        name: "王教练",
        avatar: "https://placehold.co/200x200/6366f1/white?text=Coach1",
        title: "高级教练",
        introduction: "10年教学经验，擅长纠正姿势和提升稳定性",
        specialty: ["长杆", "推杆", "沙坑"],
        certifications: ["PGA认证教练", "国家一级教练员"],
        price: 300,
        rating: 4.8,
        lessonCount: 500,
        status: "active",
      },
    }),
    prisma.coach.upsert({
      where: { id: "coach_02" },
      update: { avatar: "https://placehold.co/200x200/8b5cf6/white?text=Coach2" },
      create: {
        id: "coach_02",
        name: "李教练",
        avatar: "https://placehold.co/200x200/8b5cf6/white?text=Coach2",
        title: "资深教练",
        introduction: "专注青少年高尔夫教学，耐心细致",
        specialty: ["青少年教学", "短杆", "基础入门"],
        certifications: ["TPI认证教练"],
        price: 280,
        rating: 4.9,
        lessonCount: 300,
        status: "active",
      },
    }),
  ]);
  console.log("✅ 教练:", coaches.length, "个");

  // ========== 4. 创建积分商品 ==========
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: "product_01" },
      update: { images: ["https://placehold.co/300x300/f59e0b/white?text=Golf"] },
      create: {
        id: "product_01",
        name: "高尔夫球（3只装）",
        description: "Titleist Pro V1 比赛用球",
        images: ["https://placehold.co/300x300/f59e0b/white?text=Golf"],
        points: 500,
        originalPoints: 600,
        stock: 100,
        category: "goods",
        deliveryMethod: "pickup",
        status: "active",
        sortOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: "product_02" },
      update: { images: ["https://placehold.co/300x300/ef4444/white?text=Coupon"] },
      create: {
        id: "product_02",
        name: "30分钟免费打位券",
        description: "可在任意打位使用",
        images: ["https://placehold.co/300x300/ef4444/white?text=Coupon"],
        points: 300,
        stock: 50,
        category: "virtual",
        deliveryMethod: "pickup",
        status: "active",
        sortOrder: 10,
      },
    }),
  ]);
  console.log("✅ 商品:", products.length, "个");

  // ========== 5. 创建首页 Banner ==========
  const banners = await Promise.all([
    prisma.banner.upsert({
      where: { id: "banner_01" },
      update: { image: "https://placehold.co/750x300/22c55e/white?text=Welcome" },
      create: {
        id: "banner_01",
        title: "新场地开业优惠",
        image: "https://placehold.co/750x300/22c55e/white?text=Welcome",
        link: "/venues",
        status: "active",
        sortOrder: 1,
      },
    }),
    prisma.banner.upsert({
      where: { id: "banner_02" },
      update: { image: "https://placehold.co/750x300/3b82f6/white?text=Checkin" },
      create: {
        id: "banner_02",
        title: "签到领积分",
        image: "https://placehold.co/750x300/3b82f6/white?text=Checkin",
        link: "/checkin",
        status: "active",
        sortOrder: 2,
      },
    }),
  ]);
  console.log("✅ Banner:", banners.length, "个");

  // ========== 6. 创建系统设置 ==========
  const settings = [
    { key: "booking_advance_days", value: "7", remark: "可提前预约天数" },
    { key: "booking_cancel_hours", value: "2", remark: "免费取消提前小时数" },
    { key: "booking_min_duration", value: "30", remark: "最小预约时长（分钟）" },
    { key: "points_per_yuan", value: "1", remark: "每消费1元获得积分" },
    { key: "checkin_base_points", value: "10", remark: "每日签到基础积分" },
    { key: "referral_inviter_points", value: "100", remark: "邀请人奖励积分" },
    { key: "referral_invitee_points", value: "50", remark: "被邀请人奖励积分" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log("✅ 系统设置:", settings.length, "项");

  console.log("\n🎉 数据库播种完成！");
  console.log("📌 管理员账号: admin / 123456");
}

main()
  .catch((e) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
