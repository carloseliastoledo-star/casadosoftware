ALTER TABLE `AbandonedCheckout`
  ADD COLUMN `checkoutUrl` VARCHAR(500) NULL,
  ADD COLUMN `messageStep` INT NOT NULL DEFAULT 0,
  ADD COLUMN `lastMessageAt` DATETIME(0) NULL,
  ADD COLUMN `repliedAt` DATETIME(0) NULL,
  ADD COLUMN `updatedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE INDEX `AbandonedCheckout_lastMessageAt_idx` ON `AbandonedCheckout`(`lastMessageAt`);
