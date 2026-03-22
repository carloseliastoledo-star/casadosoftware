-- Add SEO fields to Produto
ALTER TABLE `Produto` ADD COLUMN `seoTitle` VARCHAR(191) NULL;
ALTER TABLE `Produto` ADD COLUMN `seoDescription` TEXT NULL;
ALTER TABLE `Produto` ADD COLUMN `seoContent` TEXT NULL;
