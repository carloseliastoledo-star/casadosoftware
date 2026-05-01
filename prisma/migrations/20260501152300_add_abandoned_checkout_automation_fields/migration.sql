ALTER TABLE `AbandonedCheckout`
  ADD COLUMN `source` VARCHAR(191) NULL,
  ADD COLUMN `contactedAt` DATETIME(0) NULL,
  ADD COLUMN `recoveredAt` DATETIME(0) NULL;

CREATE INDEX `AbandonedCheckout_product_idx` ON `AbandonedCheckout`(`product`);
CREATE INDEX `AbandonedCheckout_contactedAt_idx` ON `AbandonedCheckout`(`contactedAt`);
