import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

export default defineEventHandler(async (event) => {
  try {
    const session = requireAdminSession(event)

    const body = await readBody(event) || {}
    const conversationIds = Array.isArray(body?.conversationIds) ? body.conversationIds : []

    if (conversationIds.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'conversationIds é obrigatório' })
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, role: true }
    })

    if (!user) {
      throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
    }

    console.log('[chat] Deletando conversas em massa:', conversationIds.length, 'por:', user.email)

    let deletedCount = 0
    const errors: string[] = []

    for (const conversationId of conversationIds) {
      try {
        const conversation = await prisma.chatConversation.findUnique({
          where: { id: String(conversationId) }
        })

        if (!conversation) {
          errors.push(`Conversa ${conversationId} não encontrada`)
          continue
        }

        // Deletar mensagens da conversa
        await prisma.chatMessage.deleteMany({
          where: { conversationId: String(conversationId) }
        })

        // Deletar conversa
        await prisma.chatConversation.delete({
          where: { id: String(conversationId) }
        })

        deletedCount++
        console.log('[chat] Conversa deletada:', conversationId)
      } catch (err: any) {
        console.error('[chat] Error deleting conversation:', conversationId, err)
        errors.push(`Erro ao deletar conversa ${conversationId}: ${err.message}`)
      }
    }

    console.log('[chat] Conversas deletadas em massa:', deletedCount, 'por:', user.email)

    return {
      ok: true,
      deletedCount,
      totalRequested: conversationIds.length,
      errors: errors.length > 0 ? errors : undefined
    }
  } catch (err: any) {
    console.error('[chat] Error bulk deleting conversations:', err)
    if (err?.statusCode) {
      throw err
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao deletar conversas' })
  }
})
