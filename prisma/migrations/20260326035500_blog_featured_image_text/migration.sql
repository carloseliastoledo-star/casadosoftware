-- AlterTable: BlogPost.featuredImage VARCHAR(191) -> TEXT
ALTER TABLE `BlogPost` MODIFY COLUMN `featuredImage` TEXT NULL;

-- AlterTable: BlogPostTranslation.featuredImage VARCHAR(191) -> TEXT
ALTER TABLE `BlogPostTranslation` MODIFY COLUMN `featuredImage` TEXT NULL;
