-- Add international pricing per currency and Stripe fields

-- 1) Create per-currency product pricing table (scoped by store)
CREATE TABLE `ProdutoPrecoMoeda` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `storeSlug` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(16) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `oldAmount` DOUBLE NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `ProdutoPrecoMoeda_produtoId_storeSlug_currency_key`(`produtoId`, `storeSlug`, `currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProdutoPrecoMoeda` ADD CONSTRAINT `ProdutoPrecoMoeda_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- 2) Add Stripe + international fields on Order
ALTER TABLE `Order` ADD COLUMN `currency` VARCHAR(16) NULL;
ALTER TABLE `Order` ADD COLUMN `countryCode` VARCHAR(8) NULL;
ALTER TABLE `Order` ADD COLUMN `stripePaymentIntentId` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `Order_stripePaymentIntentId_key` ON `Order`(`stripePaymentIntentId`);
