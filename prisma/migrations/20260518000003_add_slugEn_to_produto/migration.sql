-- Add slugEn field to Produto table
ALTER TABLE `Produto` ADD COLUMN `slugEn` VARCHAR(191) NULL;

-- Add unique index for slugEn
CREATE UNIQUE INDEX `Produto_slugEn_key` ON `Produto`(`slugEn`);
