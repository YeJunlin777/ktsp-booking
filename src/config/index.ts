/**
 * 配置中心
 * 
 * 【架构说明】
 * 1. app.config.ts - 主配置，控制全局设置和功能开关
 * 2. modules/*.config.ts - 各子系统配置
 * 
 * 【复用原则】
 * 新项目只需：
 * 1. 修改 app.config.ts 的基础信息和功能开关
 * 2. 修改各子系统配置的文字和规则
 * 3. 部署上线
 * 
 * 无需修改任何业务代码！
 */

// 主配置
export { appConfig } from "./app.config";
export type { AppConfig } from "./app.config";

// 子系统配置
export { homeConfig } from "./modules/home.config";
export { venueConfig } from "./modules/venue.config";
export { coachConfig } from "./modules/coach.config";
export { courseConfig } from "./modules/course.config";
export { bookingConfig } from "./modules/booking.config";
export { pointsConfig } from "./modules/points.config";
export { memberConfig } from "./modules/member.config";
export { adminConfig } from "./modules/admin.config";
export { messageConfig } from "./modules/message.config";
export { couponConfig } from "./modules/coupon.config";
export { reviewConfig } from "./modules/review.config";
export { referralConfig } from "./modules/referral.config";

// 类型导出
export type { HomeConfig, CategoryItem, QuickActionItem } from "./modules/home.config";
export type { VenueConfig } from "./modules/venue.config";
export type { CoachConfig } from "./modules/coach.config";
export type { CourseConfig } from "./modules/course.config";
export type { BookingConfig } from "./modules/booking.config";
export type { PointsConfig } from "./modules/points.config";
export type { MemberConfig } from "./modules/member.config";
export type { AdminConfig } from "./modules/admin.config";
export type { MessageConfig } from "./modules/message.config";
export type { CouponConfig } from "./modules/coupon.config";
export type { ReviewConfig } from "./modules/review.config";
export type { ReferralConfig } from "./modules/referral.config";
