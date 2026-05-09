import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  try {
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

    console.log('[chat] Deletando conversa:', conversationId, 'por:', user.email)

    // Deletar mensagens da conversa
    await prisma.chatMessage.deleteMany({
      where: { conversationId }
    })

    // Deletar conversa
    await prisma.chatConversation.delete({
      where: { id: conversationId }
    })

    console.log('[chat] Conversa deletada:', conversationId, 'por:', user.email)

    return { ok: true }
  } catch (err: any) {
    console.error('[chat] Error deleting conversation:', err)
    if (err?.statusCode) {
      throw err
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar conversa' })
  }
})
