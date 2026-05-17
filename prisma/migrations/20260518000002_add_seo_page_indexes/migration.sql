-- Migration to add indexes to SeoPage.storeSlug (column already exists)
-- Manual cleanup of 20260518000000 failed entry executed on Railway
DROP INDEX `SeoPage_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`;
CREATE UNIQUE INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);
CREATE INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);