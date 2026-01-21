-- Add password and profile fields to Customer
ALTER TABLE `Customer`
  ADD COLUMN `passwordHash` VARCHAR(191) NULL,
  ADD COLUMN `nome` VARCHAR(191) NULL,
  ADD COLUMN `whatsapp` VARCHAR(191) NULL,
  ADD COLUMN `cpf` VARCHAR(191) NULL;
