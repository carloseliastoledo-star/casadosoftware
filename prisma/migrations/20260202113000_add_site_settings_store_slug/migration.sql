-- Add storeSlug to SiteSettings to separate settings per store

ALTER TABLE `SiteSettings` ADD COLUMN `storeSlug` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `SiteSettings_storeSlug_key` ON `SiteSettings`(`storeSlug`);
