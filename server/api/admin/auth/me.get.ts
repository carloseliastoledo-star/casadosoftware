import { defineEventHandler } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession.js'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  console.log('[admin/auth/me] ===== INÍCIO =====')
  
  try {
    const session = requireAdminSession(event)
    console.log('[admin/auth/me] Sessão válida:', session.email)
  
    const user = await prisma.adminUser.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, role: true }
    })

    console.log('[admin/auth/me] Usuário encontrado:', user ? 'SIM' : 'NÃO')

    if (!user) {
      console.log('[admin/auth/me] Retornando sem usuário no banco')
      return { ok: true, email: session.email, role: null }
    }

    console.log('[admin/auth/me] Retornando com usuário:', user.email, user.role)
    return { ok: true, email: session.email, role: user.role }
  } catch (err: any) {
    console.error('[admin/auth/me] ERRO:', err)
    throw err
  }
})
