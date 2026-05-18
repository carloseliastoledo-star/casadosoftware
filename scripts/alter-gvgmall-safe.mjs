/**
 * Safely adds missing columns to SiteSettings in the gvgmall DB.
 * Ignores "Duplicate column name" errors for columns that already exist.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const columns = [
  "ADD COLUMN `orderBumpTitle` VARCHAR(255) NULL",
  "ADD COLUMN `orderBumpDescription` TEXT NULL",
  "ADD COLUMN `orderBumpPrice` DOUBLE NULL DEFAULT 19",
  "ADD COLUMN `homeThemeJson` TEXT NULL",
  "ADD COLUMN `orderBumpsJson` TEXT NULL",
  "ADD COLUMN `googleAdsConfigJson` TEXT NULL",
  "ADD COLUMN `siteName` VARCHAR(255) NULL",
  "ADD COLUMN `supportEmail` VARCHAR(255) NULL",
  "ADD COLUMN `whatsappNumber` VARCHAR(64) NULL",
  "ADD COLUMN `logoPath` VARCHAR(512) NULL",
  "ADD COLUMN `themeColor` VARCHAR(32) NULL",
  "ADD COLUMN `topbarText` TEXT NULL",
  "ADD COLUMN `topbarLink` VARCHAR(512) NULL",
  "ADD COLUMN `companyLegalName` VARCHAR(255) NULL",
  "ADD COLUMN `companyCnpj` VARCHAR(32) NULL",
  "ADD COLUMN `companyAddress` VARCHAR(512) NULL",
  "ADD COLUMN `companyPhone` VARCHAR(64) NULL",
  "ADD COLUMN `companyEmail` VARCHAR(255) NULL",
  "ADD COLUMN `affiliateEnabled` TINYINT(1) NULL DEFAULT 0",
  "ADD COLUMN `seoEnableEnDomain` TINYINT(1) NULL DEFAULT 0",
  "ADD COLUMN `ptDomainUrl` VARCHAR(512) NULL",
  "ADD COLUMN `enDomainUrl` VARCHAR(512) NULL",
  "ADD COLUMN `mercadopagoPublicKey` VARCHAR(512) NULL",
  "ADD COLUMN `stripePublishableKey` VARCHAR(512) NULL",
  "ADD COLUMN `stripeSecretKey` VARCHAR(512) NULL",
  "ADD COLUMN `telegramBotToken` VARCHAR(512) NULL",
  "ADD COLUMN `telegramChatId` VARCHAR(128) NULL",
  "ADD COLUMN `smtpHost` VARCHAR(255) NULL",
  "ADD COLUMN `smtpPort` INT NULL",
  "ADD COLUMN `smtpUser` VARCHAR(255) NULL",
  "ADD COLUMN `smtpPass` VARCHAR(512) NULL",
  "ADD COLUMN `smtpFrom` VARCHAR(255) NULL",
  "ADD COLUMN `metaPixelId` VARCHAR(64) NULL",
  "ADD COLUMN `tiktokPixelId` VARCHAR(64) NULL",
]

async function main() {
  let added = 0
  let skipped = 0
  for (const col of columns) {
    const colName = col.match(/`(\w+)`/)?.[1] || col
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE \`SiteSettings\` ${col}`)
      console.log('✅ Added:', colName)
      added++
    } catch (e) {
      if (e.message?.includes('Duplicate column')) {
        console.log('⏭️  Already exists:', colName)
        skipped++
      } else {
        console.error('❌ Error on', colName, ':', e.message)
      }
    }
  }
  console.log(`\nDone: ${added} added, ${skipped} skipped.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
