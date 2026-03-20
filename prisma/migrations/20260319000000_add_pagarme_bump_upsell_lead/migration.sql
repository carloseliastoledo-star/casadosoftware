-- AddColumn pagarmeChargeId to Order
ALTER TABLE `Order` ADD COLUMN `pagarmeChargeId` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD UNIQUE INDEX `Order_pagarmeChargeId_key`(`pagarmeChargeId`);

-- AddColumn orderBump to Order
ALTER TABLE `Order` ADD COLUMN `orderBump` TINYINT(1) NOT NULL DEFAULT 0;

-- AddColumn bumpProductId to Order
ALTER TABLE `Order` ADD COLUMN `bumpProductId` VARCHAR(191) NULL;

-- AddColumn parentOrderId to Order
ALTER TABLE `Order` ADD COLUMN `parentOrderId` VARCHAR(191) NULL;

-- CreateTable Lead
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NULL,
    `storeSlug` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'abandoned',
    `bumpAdded` TINYINT(1) NOT NULL DEFAULT 0,
    `totalAmount` DOUBLE NULL,
    `criadoEm` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `Lead_email_idx`(`email`),
    INDEX `Lead_storeSlug_idx`(`storeSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
