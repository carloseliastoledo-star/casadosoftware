ALTER TABLE `SeoPage` ADD COLUMN `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';

DROP INDEX IF EXISTS `SeoPage_locale_slug_key` ON `SeoPage`;
DROP INDEX IF EXISTS `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`;
DROP INDEX IF EXISTS `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`;

CREATE UNIQUE INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);
CREATE INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
