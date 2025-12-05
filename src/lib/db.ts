import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

// 解析 DATABASE_URL
const databaseUrl = new URL(process.env.DATABASE_URL || "mysql://root:@localhost:3306/ktsp_booking");

const adapter = new PrismaMariaDb({
  host: databaseUrl.hostname,
  port: parseInt(databaseUrl.port) || 3306,
  user: databaseUrl.username,
  password: databaseUrl.password,
  database: databaseUrl.pathname.slice(1),
  connectionLimit: 10,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
