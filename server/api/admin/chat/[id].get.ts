import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const id = event.context.params?.id

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID é obrigatório' })
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  let agent = null
  if (conversation.agentId) {
    agent = await prisma.adminUser.findUnique({
      where: { id: conversation.agentId },
      select: { id: true, email: true }
    })
  }

  let closedByAgent = null
  if (conversation.closedByAgentId) {
    closedByAgent = await prisma.adminUser.findUnique({
      where: { id: conversation.closedByAgentId },
      select: { id: true, email: true }
    })
  }

  return { ok: true, conversation, agent, closedByAgent }
})
