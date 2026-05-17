-- AlterTable
ALTER TABLE `SeoPage` ADD COLUMN `storeSlug` VARCHAR(191) NOT NULL DEFAULT 'casadosoftware';

-- DropIndex
DROP INDEX `SeoPage_locale_slug_key` ON `SeoPage`;

-- CreateIndex
CREATE UNIQUE INDEX `SeoPage_storeSlug_locale_slug_key` ON `SeoPage`(`storeSlug`, `locale`, `slug`);

-- CreateIndex
CREATE INDEX `SeoPage_storeSlug_locale_status_idx` ON `SeoPage`(`storeSlug`, `locale`, `status`);
