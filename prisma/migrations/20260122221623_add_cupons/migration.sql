-- AlterTable
ALTER TABLE `Order` ADD COLUMN `couponCode` VARCHAR(191) NULL,
    ADD COLUMN `couponDiscountAmount` DOUBLE NULL,
    ADD COLUMN `couponPercent` INTEGER NULL,
    ADD COLUMN `cupomId` VARCHAR(191) NULL,
    ADD COLUMN `pixDiscountAmount` DOUBLE NULL,
    ADD COLUMN `pixDiscountPercent` INTEGER NULL,
    ADD COLUMN `subtotalAmount` DOUBLE NULL,
    ADD COLUMN `totalAmount` DOUBLE NULL;

-- CreateTable
CREATE TABLE `Cupom` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `percent` INTEGER NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `startsAt` DATETIME(0) NULL,
    `expiresAt` DATETIME(0) NULL,
    `maxUses` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `Cupom_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_cupomId_fkey` FOREIGN KEY (`cupomId`) REFERENCES `Cupom`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
