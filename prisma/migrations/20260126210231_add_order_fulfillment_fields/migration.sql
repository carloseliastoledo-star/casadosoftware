-- AlterTable
ALTER TABLE `Order` ADD COLUMN `fulfillmentError` TEXT NULL,
    ADD COLUMN `fulfillmentStatus` VARCHAR(191) NULL,
    ADD COLUMN `fulfillmentUpdatedAt` DATETIME(0) NULL;
