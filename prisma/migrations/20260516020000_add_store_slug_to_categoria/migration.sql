-- Add storeSlug to Categoria
ALTER TABLE `Categoria` ADD COLUMN `storeSlug` VARCHAR(100) NOT NULL DEFAULT 'casadosoftware';

-- Create composite unique index (slug + storeSlug) replacing the old slug-only unique
ALTER TABLE `Categoria` DROP INDEX `Categoria_slug_key`;
ALTER TABLE `Categoria` ADD UNIQUE INDEX `Categoria_slug_storeSlug_key` (`slug`, `storeSlug`);

-- Index for filtering by storeSlug
CREATE INDEX `Categoria_storeSlug_idx` ON `Categoria`(`storeSlug`);

-- Mark categories used by international products as international
UPDATE `Categoria` c
INNER JOIN `ProdutoCategoria` pc ON pc.categoriaId = c.id
INNER JOIN `Produto` p ON p.id = pc.produtoId
SET c.storeSlug = 'international'
WHERE p.storeSlug = 'international'
  AND c.storeSlug = 'casadosoftware';
