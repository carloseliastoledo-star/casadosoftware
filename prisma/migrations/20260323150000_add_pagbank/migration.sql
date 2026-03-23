ALTER TABLE `Order` ADD COLUMN `pagbankChargeId` VARCHAR(191) NULL;
ALTER TABLE `Order` ADD UNIQUE INDEX `Order_pagbankChargeId_key` (`pagbankChargeId`);
