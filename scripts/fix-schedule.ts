/**
 * 修复排班状态脚本
 * 
 * 运行: npx tsx scripts/fix-schedule.ts
 */
import { prisma } from "../src/lib/db";

async function main() {
  // 释放指定排班
  const scheduleId = "cmisol7ud001978ldqhd8gu9m";
  
  const result = await prisma.coachSchedule.update({
    where: { id: scheduleId },
    data: { isBooked: false },
  });
  
  console.log("✅ 排班已释放:", result);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
