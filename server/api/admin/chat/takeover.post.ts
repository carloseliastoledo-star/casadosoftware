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

    return { ok: true }
  } catch (err: any) {
    console.error('[takeover] Error:', err)
    if (err?.statusCode) {
      throw err
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao assumir atendimento' })
  }
})
