-- Migration to add indexes to SeoPage.storeSlug (column already exists from previous attempt)
-- Note: Railway MySQL does NOT support IF NOT EXISTS syntax
DROP INDEX `SeoPage_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`;
DROP INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`;

CREATE UNIQUE INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);
CREATE INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
