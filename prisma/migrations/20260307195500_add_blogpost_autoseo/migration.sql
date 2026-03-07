-- AlterTable
ALTER TABLE `BlogPost` ADD COLUMN `autoSeo` BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX `BlogPost_autoSeo_idx` ON `BlogPost`(`autoSeo`);
