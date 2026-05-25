-- CreateTable
CREATE TABLE `Review` (
    `id` VARCHAR(191) NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `source` VARCHAR(191) NOT NULL DEFAULT 'manual',
    `verified` BOOLEAN NOT NULL DEFAULT TRUE,
    `published` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `Review_createdAt_idx`(`createdAt`),
    INDEX `Review_productId_idx`(`productId`),
    INDEX `Review_published_idx`(`published`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
