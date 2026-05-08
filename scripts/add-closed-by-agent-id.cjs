const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addClosedByAgentIdColumn() {
  try {
    console.log('Adicionando campo closedByAgentId à tabela ChatConversation...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` ADD COLUMN \`closedByAgentId\` VARCHAR(36) NULL AFTER \`agentId\`
    `)
    console.log('✓ Campo closedByAgentId adicionado com sucesso')

    console.log('Criando índice para closedByAgentId...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX ChatConversation_closedByAgentId_idx ON ChatConversation(closedByAgentId)
    `)
    console.log('✓ Índice criado com sucesso')

    console.log('\n✓ Migration aplicada com sucesso!')
  } catch (error) {
    console.error('✗ Erro ao aplicar migration:', error.message)
    if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
      console.log('  O campo já existe.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

addClosedByAgentIdColumn()
