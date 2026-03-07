-- AlterTable
ALTER TABLE `BlogPost` ADD COLUMN `excerpt` VARCHAR(512) NULL;
ALTER TABLE `BlogPost` ADD COLUMN `keyword` VARCHAR(191) NULL;

-- Optional index to help searching by keyword
CREATE INDEX `BlogPost_keyword_idx` ON `BlogPost`(`keyword`);
