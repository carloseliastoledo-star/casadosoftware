const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addWaitingHumanFields() {
  try {
    console.log('Adicionando status WAITING_HUMAN ao enum ChatStatus...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` MODIFY COLUMN \`status\` ENUM('AI', 'WAITING_HUMAN', 'HUMAN', 'CLOSED')
    `)
    console.log('✓ Status WAITING_HUMAN adicionado ao enum')

    console.log('Adicionando campo needsHuman...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` ADD COLUMN \`needsHuman\` BOOLEAN DEFAULT FALSE AFTER \`closedByAgentId\`
    `)
    console.log('✓ Campo needsHuman adicionado')

    console.log('Adicionando campo humanRequestedAt...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` ADD COLUMN \`humanRequestedAt\` DATETIME NULL AFTER \`needsHuman\`
    `)
    console.log('✓ Campo humanRequestedAt adicionado')

    console.log('Adicionando campo humanNotifiedAt...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE \`ChatConversation\` ADD COLUMN \`humanNotifiedAt\` DATETIME NULL AFTER \`humanRequestedAt\`
    `)
    console.log('✓ Campo humanNotifiedAt adicionado')

    console.log('Criando índice para needsHuman...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX ChatConversation_needsHuman_idx ON ChatConversation(needsHuman)
    `)
    console.log('✓ Índice needsHuman criado')

    console.log('Criando índice para humanRequestedAt...')
    await prisma.$executeRawUnsafe(`
      CREATE INDEX ChatConversation_humanRequestedAt_idx ON ChatConversation(humanRequestedAt)
    `)
    console.log('✓ Índice humanRequestedAt criado')

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

addWaitingHumanFields()
