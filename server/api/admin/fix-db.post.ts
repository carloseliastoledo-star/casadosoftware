import { defineEventHandler, createError } from 'h3'
import prisma from '../../../db/prisma.js'
import { requireAdminSession } from '../../../utils/adminSession.js'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const prismaAny = prisma as any

  // Fix NULL storeSlug in Produto
  const result = await prismaAny.$executeRawUnsafe(`UPDATE Produto SET storeSlug = 'casadosoftware' WHERE storeSlug IS NULL`)

  return { ok: true, message: 'Fixed NULL storeSlug in Produto', affectedRows: result }
})
