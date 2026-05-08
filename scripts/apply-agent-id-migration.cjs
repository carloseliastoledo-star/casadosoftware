const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('Adicionando campo agentId à tabela ChatConversation...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` ADD COLUMN \`agentId\` VARCHAR(25) NULL AFTER \`userIp\`
    `)
    console.log('✓ Campo agentId adicionado com sucesso')

    console.log('Criando índice para agentId...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX ChatConversation_agentId_idx ON ChatConversation(agentId)
    `)
    console.log('✓ Índice criado com sucesso')

    console.log('\n✓ Migration aplicada com sucesso!')
  } catch (error) {
    console.error('✗ Erro ao aplicar migration:', error.message)
    if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
      console.log('  A migration já foi aplicada.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
