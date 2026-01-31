-- Add per-store product price overrides

CREATE TABLE `ProdutoPrecoLoja` (
    `id` VARCHAR(191) NOT NULL,
    `produtoId` VARCHAR(191) NOT NULL,
    `storeSlug` VARCHAR(191) NOT NULL,
    `preco` DOUBLE NOT NULL,
    `precoAntigo` DOUBLE NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `ProdutoPrecoLoja_produtoId_storeSlug_key`(`produtoId`, `storeSlug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ProdutoPrecoLoja` ADD CONSTRAINT `ProdutoPrecoLoja_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
