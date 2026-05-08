import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody(event) || {}
  const conversationId = String(body?.conversationId || '').trim()

  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
  }

  const conversation = await (prisma as any).chatConversation.findUnique({
    where: { id: conversationId }
  })

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  await (prisma as any).chatConversation.update({
    where: { id: conversationId },
    data: { status: 'CLOSED' }
  })

  await (prisma as any).chatMessage.create({
    data: {
      conversationId,
      sender: 'SYSTEM',
      content: 'Atendimento encerrado.'
    }
  })

  return { ok: true }
})
