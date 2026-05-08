import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  console.log('[takeover] START')
  
  const session = requireAdminSession(event)
  console.log('[takeover] Session:', session)

  const body = await readBody(event) || {}
  const conversationId = String(body?.conversationId || '').trim()
  console.log('[takeover] ConversationId:', conversationId)

  if (!conversationId) {
    throw createError({ statusCode: 400, statusMessage: 'conversationId é obrigatório' })
  }

  const user = await prisma.adminUser.findUnique({
    where: { email: session.email },
    select: { id: true, email: true, role: true }
  })

  console.log('[takeover] User:', user)

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  }

  const conversation = await prisma.chatConversation.findUnique({
    where: { id: conversationId }
  })

  console.log('[takeover] Conversation:', conversation)

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversa não encontrada' })
  }

  if (conversation.status !== 'HUMAN') {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status: 'HUMAN', agentId: user.id }
    })
  } else if (!conversation.agentId) {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { agentId: user.id }
    })
  }

  await prisma.chatMessage.create({
    data: {
      conversationId,
      sender: 'SYSTEM',
      content: 'Atendimento transferido para um atendente humano.'
    }
  })

  console.log('[takeover] SUCCESS')
  return { ok: true }
})
