import { defineEventHandler } from 'h3'
import { requireAdminSession } from '../../../utils/adminSession.js'
import prisma from '../../../db/prisma'

export default defineEventHandler(async (event) => {
  const session = requireAdminSession(event)
  
  const user = await prisma.adminUser.findUnique({
    where: { email: session.email },
    select: { id: true, email: true, role: true }
  })

  if (!user) {
    return { ok: true, email: session.email, role: null }
  }

  return { ok: true, email: session.email, role: user.role }
})
