-- CreateTable
CREATE TABLE `BlogPostTranslation` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `lang` VARCHAR(191) NOT NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `featuredImage` VARCHAR(191) NULL,
    `excerpt` VARCHAR(512) NULL,
    `html` TEXT NULL,
    `criadoEm` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `atualizadoEm` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE INDEX `BlogPostTranslation_postId_lang_key`(`postId`, `lang`),
    INDEX `BlogPostTranslation_lang_idx`(`lang`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BlogPostTranslation` ADD CONSTRAINT `BlogPostTranslation_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `BlogPost`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

