import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { generateVendorToken } from '../../../utils/vendorAuth'

export default defineEventHandler(async (event) => {
  await requireAdminSession(event)

  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'name obrigatório' })
  }

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'email inválido' })
  }

  const vendor = await (prisma as any).vendor.upsert({
    where: { email },
    create: { name, email },
    update: { name },
    select: { id: true, name: true, email: true, createdAt: true }
  })

  const token = generateVendorToken(vendor.email)

  return {
    ok: true,
    vendor,
    dashboardUrl: `/vendor/dashboard?email=${encodeURIComponent(vendor.email)}&token=${encodeURIComponent(token)}`
  }
})
