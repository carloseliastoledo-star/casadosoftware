import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)

  const body = await readBody(event) || {}
  const conversationId = String(body?.conversationId || '').trim()

  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: session.email },
    select: { id: true, email: true, role: true }
  })

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  await prisma.chatConversation.update({
    where: { id: conversationId },
    data: { status: 'CLOSED', closedByAgentId: user.id }
  })

  await prisma.chatMessage.create({
    data: {
      conversationId,
      sender: 'SYSTEM',
      content: 'Atendimento encerrado.'
    }
  })

  return { ok: true }
})
