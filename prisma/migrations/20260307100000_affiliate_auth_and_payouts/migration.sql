-- AlterTable
ALTER TABLE `Affiliate` ADD COLUMN `passwordHash` VARCHAR(191) NULL,
    ADD COLUMN `inviteTokenHash` VARCHAR(191) NULL,
    ADD COLUMN `inviteExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `AffiliateCommission` ADD COLUMN `availableAt` DATETIME(3) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL;

-- CreateTable
CREATE TABLE `AffiliatePayoutRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `affiliateId` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'requested',
    `note` TEXT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0),

    INDEX `AffiliatePayoutRequest_affiliateId_idx`(`affiliateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AffiliatePayoutRequest` ADD CONSTRAINT `AffiliatePayoutRequest_affiliateId_fkey` FOREIGN KEY (`affiliateId`) REFERENCES `Affiliate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
