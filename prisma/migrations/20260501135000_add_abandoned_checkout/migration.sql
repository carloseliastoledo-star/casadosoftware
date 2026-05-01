CREATE TABLE `AbandonedCheckout` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `product` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'started',
  `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

  INDEX `AbandonedCheckout_email_idx`(`email`),
  INDEX `AbandonedCheckout_phone_idx`(`phone`),
  INDEX `AbandonedCheckout_status_idx`(`status`),
  INDEX `AbandonedCheckout_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
