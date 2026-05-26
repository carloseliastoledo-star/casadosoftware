-- Migration: adiciona campos de agendamento ao BlogPost
-- Compatível com MySQL 5.7+

ALTER TABLE `BlogPost` ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'draft';
ALTER TABLE `BlogPost` ADD COLUMN `scheduledAt` DATETIME(0) NULL;
ALTER TABLE `BlogPost` ADD COLUMN `publishedAt` DATETIME(0) NULL;
ALTER TABLE `BlogPost` ADD COLUMN `seoTitle` VARCHAR(255) NULL;
ALTER TABLE `BlogPost` ADD COLUMN `seoDescription` VARCHAR(512) NULL;

-- Backfill: posts já publicados viram "published"
UPDATE `BlogPost` SET
  `status`      = 'published',
  `publishedAt` = `criadoEm`
WHERE `publicado` = 1;

-- Índice para consultas de agendamento
CREATE INDEX `BlogPost_status_scheduledAt_idx`
  ON `BlogPost` (`status`, `scheduledAt`);
