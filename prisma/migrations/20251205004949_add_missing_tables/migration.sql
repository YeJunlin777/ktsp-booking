/*
  Warnings:

  - You are about to drop the column `description` on the `coaches` table. All the data in the column will be lost.
  - You are about to alter the column `specialty` on the `coaches` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the column `image` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `content` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `venues` table. All the data in the column will be lost.
  - Added the required column `price` to the `venues` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `coaches` DROP COLUMN `description`,
    ADD COLUMN `certifications` JSON NULL,
    ADD COLUMN `introduction` TEXT NULL,
    ADD COLUMN `lessonCount` INTEGER NOT NULL DEFAULT 0,
    MODIFY `specialty` JSON NULL;

-- AlterTable
ALTER TABLE `courses` ADD COLUMN `category` VARCHAR(191) NULL,
    ADD COLUMN `coachId` VARCHAR(191) NULL,
    ADD COLUMN `enrollDeadline` DATETIME(3) NULL,
    ADD COLUMN `requirements` TEXT NULL,
    ADD COLUMN `syllabus` JSON NULL,
    ADD COLUMN `totalLessons` INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `image`,
    DROP COLUMN `type`,
    ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'goods',
    ADD COLUMN `deliveryMethod` VARCHAR(191) NOT NULL DEFAULT 'pickup',
    ADD COLUMN `images` JSON NULL,
    ADD COLUMN `originalPoints` INTEGER NULL,
    ADD COLUMN `salesCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `specifications` JSON NULL;

-- AlterTable
ALTER TABLE `reviews` DROP COLUMN `content`,
    DROP COLUMN `rating`,
    ADD COLUMN `coachComment` TEXT NULL,
    ADD COLUMN `coachId` VARCHAR(191) NULL,
    ADD COLUMN `coachRating` INTEGER NULL,
    ADD COLUMN `venueComment` TEXT NULL,
    ADD COLUMN `venueId` VARCHAR(191) NULL,
    ADD COLUMN `venueRating` INTEGER NULL;

-- AlterTable
ALTER TABLE `venues` DROP COLUMN `image`,
    ADD COLUMN `closeTime` VARCHAR(191) NOT NULL DEFAULT '22:00',
    ADD COLUMN `facilities` JSON NULL,
    ADD COLUMN `images` JSON NULL,
    ADD COLUMN `maxDuration` INTEGER NOT NULL DEFAULT 240,
    ADD COLUMN `minDuration` INTEGER NOT NULL DEFAULT 30,
    ADD COLUMN `openTime` VARCHAR(191) NOT NULL DEFAULT '08:00',
    ADD COLUMN `peakPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `price` DECIMAL(10, 2) NOT NULL;

-- CreateTable
CREATE TABLE `coupon_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `value` DECIMAL(10, 2) NOT NULL,
    `minAmount` DECIMAL(10, 2) NULL,
    `maxDiscount` DECIMAL(10, 2) NULL,
    `applicableTypes` JSON NULL,
    `totalQuantity` INTEGER NULL,
    `claimedCount` INTEGER NOT NULL DEFAULT 0,
    `perUserLimit` INTEGER NOT NULL DEFAULT 1,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `validDays` INTEGER NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT true,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_coupons` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'available',
    `usedAt` DATETIME(3) NULL,
    `usedOrderId` VARCHAR(191) NULL,
    `expireAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_coupons_code_key`(`code`),
    INDEX `user_coupons_userId_idx`(`userId`),
    INDEX `user_coupons_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `holidays` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'holiday',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `holidays_date_key`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blacklist` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `createdBy` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blacklist_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_invitations` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `inviterId` VARCHAR(191) NOT NULL,
    `inviteeId` VARCHAR(191) NULL,
    `invitePhone` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_invitations_bookingId_idx`(`bookingId`),
    INDEX `booking_invitations_inviteeId_idx`(`inviteeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `referral_records` (
    `id` VARCHAR(191) NOT NULL,
    `inviterId` VARCHAR(191) NOT NULL,
    `inviteeId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `inviterReward` INTEGER NOT NULL DEFAULT 0,
    `inviteeReward` INTEGER NOT NULL DEFAULT 0,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `referral_records_inviterId_idx`(`inviterId`),
    UNIQUE INDEX `referral_records_inviterId_inviteeId_key`(`inviterId`, `inviteeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_tasks` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `points` INTEGER NOT NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'once',
    `dailyLimit` INTEGER NULL,
    `icon` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',

    UNIQUE INDEX `point_tasks_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `point_task_completions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `taskId` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `point_task_completions_userId_taskId_idx`(`userId`, `taskId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_coupons` ADD CONSTRAINT `user_coupons_templateId_fkey` FOREIGN KEY (`templateId`) REFERENCES `coupon_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_venueId_fkey` FOREIGN KEY (`venueId`) REFERENCES `venues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_coachId_fkey` FOREIGN KEY (`coachId`) REFERENCES `coaches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `point_task_completions` ADD CONSTRAINT `point_task_completions_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `point_tasks`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
