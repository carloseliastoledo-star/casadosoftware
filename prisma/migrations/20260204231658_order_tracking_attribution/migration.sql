-- AlterTable
ALTER TABLE `BlogPost` ALTER COLUMN `atualizadoEm` DROP DEFAULT;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `fbclid` VARCHAR(191) NULL,
    ADD COLUMN `gclid` VARCHAR(191) NULL,
    ADD COLUMN `landingPage` TEXT NULL,
    ADD COLUMN `referrer` TEXT NULL,
    ADD COLUMN `trafficSourceType` VARCHAR(191) NULL,
    ADD COLUMN `utmCampaign` VARCHAR(191) NULL,
    ADD COLUMN `utmContent` VARCHAR(191) NULL,
    ADD COLUMN `utmMedium` VARCHAR(191) NULL,
    ADD COLUMN `utmSource` VARCHAR(191) NULL,
    ADD COLUMN `utmTerm` VARCHAR(191) NULL,
    MODIFY `currency` VARCHAR(191) NULL,
    MODIFY `countryCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `ProdutoPrecoMoeda` MODIFY `currency` VARCHAR(191) NOT NULL;
