import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, Errors } from "@/lib/response";
import { BookingService } from "@/lib/booking-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 生成时段列表
 */
function generateTimeSlots(openTime: string, closeTime: string, duration: number) {
  const slots: string[] = [];
  const [openHour, openMin] = openTime.split(":").map(Number);
  const [closeHour, closeMin] = closeTime.split(":").map(Number);
  
  let currentHour = openHour;
  let currentMin = openMin;

  while (
    currentHour < closeHour ||
    (currentHour === closeHour && currentMin < closeMin)
  ) {
    const timeStr = `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(2, "0")}`;
    slots.push(timeStr);

    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

/**
 * 判断是否为高峰时段
 */
function isPeakTime(time: string, date: string): boolean {
  const [hour] = time.split(":").map(Number);
  const dayOfWeek = new Date(date).getDay();
  
  // 周末或晚间 18:00-21:00 为高峰
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isEveningPeak = hour >= 18 && hour < 21;
  
  return isWeekend || isEveningPeak;
}

/**
 * 场地时段 API
 * 
 * GET /api/venues/[id]/slots
 * Query: date - 查询日期 (YYYY-MM-DD)
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return Errors.INVALID_PARAMS("请选择日期");
    }

    // 获取场地信息
    const venue = await prisma.venue.findUnique({
      where: { id },
      select: {
        id: true,
        openTime: true,
        closeTime: true,
        minDuration: true,
        price: true,
        peakPrice: true,
        status: true,
      },
    });

    if (!venue) {
      return Errors.NOT_FOUND("场地不存在");
    }

    if (venue.status !== "active") {
      return success([]);
    }

    // 生成时段
    const allSlots = generateTimeSlots(
      venue.openTime,
      venue.closeTime,
      venue.minDuration
    );

    // 使用服务层获取已预约时段（统一逻辑）
    const bookedSlots = await BookingService.getBookedSlots("venue", id, date);

    // 收集已预约的时段
    const bookedTimes = new Set<string>();
    bookedSlots.forEach((slot) => {
      bookedTimes.add(slot.startTime);
    });
    
    const basePrice = Number(venue.price);
    const peakPrice = venue.peakPrice ? Number(venue.peakPrice) : basePrice;

    // 构建返回数据
    const slots = allSlots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
      price: isPeakTime(time, date) ? peakPrice : basePrice,
    }));

    return success({
      slots,
      bookedSlots,  // 新增：返回已占用时段详情
      basePrice,
      peakPrice,
    });
  } catch (error) {
    console.error("获取时段失败:", error);
    return Errors.INTERNAL_ERROR();
  }
}
