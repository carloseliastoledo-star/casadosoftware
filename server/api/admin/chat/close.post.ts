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

  console.log('[chat] Encerrando conversa:', conversationId, 'por:', user.email, 'status atual:', conversation.status)

  try {
    await prisma.chatConversation.update({
      where: { id: conversationId },
      data: { status: 'CLOSED', closedByAgentId: user.id }
    })
    console.log('[chat] Status atualizado para CLOSED:', conversationId)
  } catch (error) {
    console.error('[chat] Erro ao atualizar status para CLOSED:', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao encerrar conversa' })
  }

  console.log('[chat] Conversa encerrada:', conversationId, 'por:', user.email)

  try {
    await prisma.chatMessage.create({
      data: {
        conversationId,
        sender: 'SYSTEM',
        content: 'Atendimento encerrado.'
      }
    })
  } catch (error) {
    console.error('[chat] Erro ao criar mensagem de encerramento:', error)
    // Não falha se a mensagem não for criada
  }

  return { ok: true }
})
