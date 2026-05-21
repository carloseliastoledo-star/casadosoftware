const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createOffice365TrialTable() {
  try {
    console.log('Criando tabela Office365TrialLead...')
    
    // Executar SQL direto para criar a tabela
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Office365TrialLead (
        id VARCHAR(191) NOT NULL PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        email VARCHAR(191) NOT NULL,
        whatsapp VARCHAR(191) NOT NULL,
        usageType VARCHAR(191) NOT NULL,
        systemType VARCHAR(191) NOT NULL,
        status VARCHAR(191) NOT NULL DEFAULT 'PENDING',
        trialStartAt DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        trialExpiresAt DATETIME(0) NOT NULL,
        checkoutUrl VARCHAR(191) NULL,
        microsoftLogin VARCHAR(191) NULL,
        temporaryPassword VARCHAR(191) NULL,
        notes TEXT NULL,
        createdAt DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX Office365TrialLead_email_index (email),
        INDEX Office365TrialLead_status_index (status),
        INDEX Office365TrialLead_trialExpiresAt_index (trialExpiresAt),
        INDEX Office365TrialLead_createdAt_index (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    
    console.log('✓ Tabela Office365TrialLead criada com sucesso!')
    
    await prisma.$disconnect()
  } catch (error) {
    console.error('Erro ao criar tabela:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

createOffice365TrialTable()
