-- AlterTable: add storeSlug if not exists
ALTER TABLE `SeoPage` ADD COLUMN IF NOT EXISTS `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';

-- DropIndex: drop old unique index (ignore error if already gone)
ALTER TABLE `SeoPage` DROP INDEX IF EXISTS `SeoPage_locale_slug_key`;

-- CreateIndex: new unique with storeSlug
CREATE UNIQUE INDEX IF NOT EXISTS `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);

-- CreateIndex: new index for filtering
CREATE INDEX IF NOT EXISTS `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
