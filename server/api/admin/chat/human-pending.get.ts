import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const startTime = Date.now()

  // Buscar conversas com status WAITING_HUMAN
  const waitingConversations = await prisma.chatConversation.findMany({
    where: {
      status: 'WAITING_HUMAN'
    },
    orderBy: {
      humanRequestedAt: 'desc'
    }
  })

  console.log('[admin] WAITING_HUMAN queries:', waitingConversations.length, 'time:', Date.now() - startTime, 'ms')

  // Atualizar humanNotifiedAt para conversas que ainda não foram notificadas
  for (const conv of waitingConversations) {
    if (!conv.humanNotifiedAt) {
      await prisma.chatConversation.update({
        where: { id: conv.id },
        data: { humanNotifiedAt: new Date() }
      })
      console.log('[admin] Marcando como notificado:', conv.id)
    }
  }

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

  console.log('[admin] AI conversations (24h):', aiConversations.length, 'time:', Date.now() - startTime, 'ms')

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

    const hasHumanRequest = messages.some((msg: any) => 
      msg.content.toLowerCase().includes('aguardando atendimento humano') ||
      msg.content.toLowerCase().includes('atendimento humano') ||
      msg.content.toLowerCase().includes('encaminhar atendente')
    )

    if (hasHumanRequest) {
      legacyPending.push(conv)
    }
  }

  const allPending = [...waitingConversations, ...legacyPending]

  const totalTime = Date.now() - startTime
  console.log('[admin] atendimentos humanos pendentes:', allPending.length, 'total time:', totalTime, 'ms')

  return {
    ok: true,
    count: allPending.length,
    conversations: allPending,
    performance: {
      totalTime,
      waitingCount: waitingConversations.length,
      legacyCount: legacyPending.length
    }
  }
})
