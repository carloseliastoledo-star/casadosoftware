const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function applyMigration() {
  try {
    console.log('Adicionando role agent ao enum AdminRole...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`AdminUser\` MODIFY COLUMN \`role\` ENUM('admin', 'editor', 'agent') NOT NULL
    `)
    console.log('✓ Role agent adicionado com sucesso ao enum AdminRole')
  } catch (error) {
    console.error('✗ Erro ao aplicar migration:', error.message)
    if (error.message.includes('Duplicate') || error.message.includes('already exists')) {
      console.log('  A migration já foi aplicada ou o role já existe.')
    }
  } finally {
    await prisma.$disconnect()
  }
}

applyMigration()
