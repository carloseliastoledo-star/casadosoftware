-- Add sequential order number starting at 1200
ALTER TABLE `Order`
  ADD COLUMN `numero` INT NOT NULL AUTO_INCREMENT,
  ADD UNIQUE INDEX `Order_numero_key` (`numero`);

-- Backfill existing orders deterministically (oldest first)
SET @rownum := 1199;
UPDATE `Order`
SET numero = (@rownum := @rownum + 1)
ORDER BY criadoEm ASC, id ASC;

-- Set next number
SET @next_num := (SELECT COALESCE(MAX(numero), 1199) + 1 FROM `Order`);
SET @sql := CONCAT('ALTER TABLE `Order` AUTO_INCREMENT = ', @next_num);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
