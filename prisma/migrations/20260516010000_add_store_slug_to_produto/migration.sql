-- Add storeSlug to Produto table
-- Existing products default to 'casadosoftware' — international products will be updated by the CSV importer
ALTER TABLE `Produto` ADD COLUMN `storeSlug` VARCHAR(100) NOT NULL DEFAULT 'casadosoftware';

-- Add index for efficient filtering by storeSlug
CREATE INDEX `Produto_storeSlug_idx` ON `Produto`(`storeSlug`);
