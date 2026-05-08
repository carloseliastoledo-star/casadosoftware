const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('Criando tabela ChatConversation...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ChatConversation (
        id VARCHAR(25) NOT NULL,
        customerName VARCHAR(255) NULL,
        customerEmail VARCHAR(255) NULL,
        orderNumber VARCHAR(255) NULL,
        status ENUM('AI', 'HUMAN', 'CLOSED') NOT NULL DEFAULT 'AI',
        sourcePage TEXT NULL,
        userIp VARCHAR(255) NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX ChatConversation_status_idx (status),
        INDEX ChatConversation_createdAt_idx (createdAt),
        INDEX ChatConversation_updatedAt_idx (updatedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Tabela ChatConversation criada com sucesso')

    console.log('Criando tabela ChatMessage...')
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS ChatMessage (
        id VARCHAR(25) NOT NULL,
        conversationId VARCHAR(25) NOT NULL,
        sender ENUM('CUSTOMER', 'AI', 'AGENT', 'SYSTEM') NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        PRIMARY KEY (id),
        INDEX ChatMessage_conversationId_idx (conversationId),
        INDEX ChatMessage_createdAt_idx (createdAt),
        CONSTRAINT ChatMessage_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES ChatConversation(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log('✓ Tabela ChatMessage criada com sucesso')

    console.log('\n✓ Migration aplicada com sucesso!')
  } catch (error) {
    console.error('✗ Erro ao aplicar migration:', error.message)
    if (error.message.includes('already exists')) {
      console.log('  As tabelas já existem, nada a fazer.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
