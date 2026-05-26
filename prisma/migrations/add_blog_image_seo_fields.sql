-- Migration: add imageAlt, imageTitle, imageCaption to BlogPost and BlogPostTranslation
ALTER TABLE `BlogPost`
  ADD COLUMN IF NOT EXISTS `imageAlt` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageTitle` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageCaption` VARCHAR(191) NULL;

ALTER TABLE `BlogPostTranslation`
  ADD COLUMN IF NOT EXISTS `imageAlt` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageTitle` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageCaption` VARCHAR(191) NULL;
