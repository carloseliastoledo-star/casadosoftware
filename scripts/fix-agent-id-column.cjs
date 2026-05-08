const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAgentIdColumn() {
  try {
    console.log('Alterando coluna agentId para VARCHAR(36)...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` MODIFY COLUMN \`agentId\` VARCHAR(36) NULL
    `)
    console.log('✓ Coluna agentId alterada com sucesso')
  } catch (error) {
    console.error('✗ Erro ao alterar coluna:', error.message)
    if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
      console.log('  A coluna já está com o tipo correto.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixAgentIdColumn()
