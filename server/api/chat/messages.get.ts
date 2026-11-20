import { defineEventHandler, getQuery, createError, setResponseHeader } from 'h3'
import prisma from '../../db/prisma'
import { requireChatSession } from '../../utils/chatSession'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const conversationId = String(query?.conversationId || '').trim()

  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
  }

  setResponseHeader(event, 'Cache-Control', 'no-store')
  requireChatSession(event, conversationId)

  const conversation = await (prisma as any).chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  const messages = await (prisma as any).chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      sender: true,
      content: true,
      createdAt: true
    }
  })

  return {
    conversationId,
    status: conversation.status,
    messages
  }
})
