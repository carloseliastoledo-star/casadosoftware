ALTER TABLE `BlogPost` ADD COLUMN `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';
ALTER TABLE `PartnerApplication` ADD COLUMN `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';
CREATE INDEX `BlogPost_storeSlug_idx` ON `BlogPost`(`storeSlug`);
CREATE INDEX `PartnerApplication_storeSlug_idx` ON `PartnerApplication`(`storeSlug`);
