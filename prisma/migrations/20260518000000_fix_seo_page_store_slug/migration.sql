ALTER TABLE `SeoPage` ADD COLUMN IF NOT EXISTS `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';

-- Drop old unique index if it exists (slug+locale without storeSlug)
DROP INDEX IF EXISTS `SeoPage_locale_slug_key` ON `SeoPage`;

-- Create new unique index with storeSlug
CREATE UNIQUE INDEX IF NOT EXISTS `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);

-- Create search index
CREATE INDEX IF NOT EXISTS `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
