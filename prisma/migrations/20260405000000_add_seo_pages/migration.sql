-- CreateTable
CREATE TABLE `SeoPage` (
    `id` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `seoTitle` VARCHAR(191) NULL,
    `seoDescription` TEXT NULL,
    `h1` VARCHAR(191) NULL,
    `heroBadge` VARCHAR(191) NULL,
    `heroDescription` TEXT NULL,
    `contentHtml` LONGTEXT NULL,
    `faqJson` TEXT NULL,
    `linkedProductSlug` VARCHAR(191) NULL,
    `linkedCategorySlug` VARCHAR(191) NULL,
    `templateKey` VARCHAR(191) NOT NULL DEFAULT 'default-money-page',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `noindex` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(0) NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    UNIQUE INDEX `SeoPage_locale_slug_key`(`locale`, `slug`),
    INDEX `SeoPage_locale_status_idx`(`locale`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
