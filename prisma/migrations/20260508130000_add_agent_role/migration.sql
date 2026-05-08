-- Add 'agent' role to AdminRole enum
ALTER TABLE `AdminUser` MODIFY COLUMN `role` ENUM('admin', 'editor', 'agent') NOT NULL;
