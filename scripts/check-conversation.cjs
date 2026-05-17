const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkConversation() {
  const conversationId = process.argv[2] || 'cmoxn3vvk00008mg44y3kl8ff'
  
  try {
    const conversation = await prisma.chatConversation.findUnique({
      where: { id: conversationId }
    })
    
    if (!conversation) {
      console.log('Conversa não encontrada')
      return
    }
    
    console.log('ID:', conversation.id)
    console.log('Cliente:', conversation.customerName)
    console.log('Status:', conversation.status)
    console.log('closedByAgentId:', conversation.closedByAgentId)
    console.log('humanRequestedAt:', conversation.humanRequestedAt)
    console.log('humanNotifiedAt:', conversation.humanNotifiedAt)
    console.log('needsHuman:', conversation.needsHuman)
    console.log('updatedAt:', conversation.updatedAt)
    console.log('createdAt:', conversation.createdAt)
  } catch (error) {
    console.error('Erro:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkConversation()
