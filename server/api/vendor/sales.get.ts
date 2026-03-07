import { defineEventHandler, getQuery, createError } from 'h3'
import prisma from '../../db/prisma'
import { verifyVendorToken } from '../../utils/vendorAuth'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const email = String((q as any)?.email || '').trim().toLowerCase()
  const token = String((q as any)?.token || '').trim()

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Missing vendor email' })
  }
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'Missing token' })
  }

  const ok = verifyVendorToken(token, email)
  if (!ok.ok) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  const vendor = await (prisma as any).vendor.findUnique({
    where: { email },
    select: { id: true }
  })
  if (!vendor) {
    throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
  }

  const orders = await (prisma as any).order.findMany({
    where: {
      status: 'PAID',
      produto: { vendorId: vendor.id }
    },
    orderBy: { pagoEm: 'desc' },
    take: 200,
    select: {
      id: true,
      status: true,
      totalAmount: true,
      currency: true,
      pagoEm: true,
      produto: { select: { id: true, nome: true } }
    }
  })

  return { ok: true, orders }
})
