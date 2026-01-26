-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `passwordResetExpiresAt` DATETIME(0) NULL,
    ADD COLUMN `passwordResetTokenHash` VARCHAR(191) NULL;
