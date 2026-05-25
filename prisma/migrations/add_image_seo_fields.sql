-- Migration: add imageAlt, imageTitle, imageCaption to Produto
ALTER TABLE `Produto`
  ADD COLUMN IF NOT EXISTS `imageAlt` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageTitle` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `imageCaption` VARCHAR(191) NULL;
