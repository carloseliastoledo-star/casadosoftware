-- Fix Categoria.id: MySQL does not support @default(uuid()) natively via Prisma DDL,
-- but the application now generates UUID via crypto.randomUUID() before inserting.
-- No DDL change needed for the default — the column already accepts any String.

-- Fix Produto.imagem: expand from VARCHAR(191) to TEXT to support long image URLs
ALTER TABLE `Produto` MODIFY COLUMN `imagem` LONGTEXT NULL;
