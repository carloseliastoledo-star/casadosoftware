import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  // Buscar conversas com status WAITING_HUMAN
  const waitingConversations = await prisma.chatConversation.findMany({
    where: {
      status: 'WAITING_HUMAN'
    },
    orderBy: {
      humanRequestedAt: 'desc'
    }
  })

  // Tratar conversas antigas com status AI mas com mensagem indicando atendimento humano
  // Apenas conversas das últimas 24h para não sobrecarregar o banco
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  const aiConversations = await prisma.chatConversation.findMany({
    where: {
      status: 'AI',
      updatedAt: {
        gte: twentyFourHoursAgo
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })

  const legacyPending: any[] = []
  for (const conv of aiConversations) {
    const messages = await prisma.chatMessage.findMany({
      where: { 
        conversationId: conv.id,
        createdAt: {
          gte: twentyFourHoursAgo
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3 // Reduzido de 5 para 3
    })

    const hasHumanRequest = messages.some(msg => 
      msg.content.toLowerCase().includes('aguardando atendimento humano') ||
      msg.content.toLowerCase().includes('atendimento humano') ||
      msg.content.toLowerCase().includes('encaminhar atendente')
    )

    if (hasHumanRequest) {
      legacyPending.push(conv)
    }
  }

  const allPending = [...waitingConversations, ...legacyPending]

  console.log('[admin] atendimentos humanos pendentes:', allPending.length)

  return {
    ok: true,
    count: allPending.length,
    conversations: allPending
  }
})
