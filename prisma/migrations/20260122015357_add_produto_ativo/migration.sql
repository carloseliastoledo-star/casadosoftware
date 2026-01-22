-- AlterTable
 SET @col_exists := (
   SELECT COUNT(*)
   FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'Produto'
     AND COLUMN_NAME = 'tutorialConteudo'
 );
 SET @sql := IF(
   @col_exists = 0,
   'ALTER TABLE `Produto` ADD COLUMN `tutorialConteudo` TEXT NULL',
   'SELECT 1'
 );
 PREPARE stmt FROM @sql;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;

 SET @col_exists := (
   SELECT COUNT(*)
   FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'Produto'
     AND COLUMN_NAME = 'tutorialSubtitulo'
 );
 SET @sql := IF(
   @col_exists = 0,
   'ALTER TABLE `Produto` ADD COLUMN `tutorialSubtitulo` VARCHAR(191) NULL',
   'SELECT 1'
 );
 PREPARE stmt FROM @sql;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;

 SET @col_exists := (
   SELECT COUNT(*)
   FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE()
     AND TABLE_NAME = 'Produto'
     AND COLUMN_NAME = 'tutorialTitulo'
 );
 SET @sql := IF(
   @col_exists = 0,
   'ALTER TABLE `Produto` ADD COLUMN `tutorialTitulo` VARCHAR(191) NULL',
   'SELECT 1'
 );
 PREPARE stmt FROM @sql;
 EXECUTE stmt;
 DEALLOCATE PREPARE stmt;
