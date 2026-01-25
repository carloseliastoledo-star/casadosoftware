/*
  Warnings:

  - You are about to drop the `_CategoriaToProduto` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `_CategoriaToProduto` DROP FOREIGN KEY `_CategoriaToProduto_A_fkey`;

-- DropForeignKey
ALTER TABLE `_CategoriaToProduto` DROP FOREIGN KEY `_CategoriaToProduto_B_fkey`;

-- DropTable
DROP TABLE `_CategoriaToProduto`;

-- CreateTable
CREATE TABLE `ProdutoCategoria` (
    `produtoId` VARCHAR(191) NOT NULL,
    `categoriaId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`produtoId`, `categoriaId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProdutoCategoria` ADD CONSTRAINT `ProdutoCategoria_produtoId_fkey` FOREIGN KEY (`produtoId`) REFERENCES `Produto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProdutoCategoria` ADD CONSTRAINT `ProdutoCategoria_categoriaId_fkey` FOREIGN KEY (`categoriaId`) REFERENCES `Categoria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
