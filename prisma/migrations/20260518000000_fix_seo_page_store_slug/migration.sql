-- Migration re-created after manual cleanup of failed entry from Railway
-- Adds storeSlug column and indexes to SeoPage table
-- Note: Railway MySQL does NOT support IF NOT EXISTS syntax
ALTER TABLE `SeoPage` ADD COLUMN `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';

DROP INDEX `SeoPage_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`;

CREATE UNIQUE INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);
CREATE INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
