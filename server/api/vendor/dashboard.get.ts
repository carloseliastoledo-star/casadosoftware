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
    select: { id: true, name: true, email: true, createdAt: true }
  })

  if (!vendor) {
    throw createError({ statusCode: 404, statusMessage: 'Vendor not found' })
  }

  const [productsCount, salesCount, commissionAgg] = await Promise.all([
    (prisma as any).produto.count({ where: { vendorId: vendor.id } }),
    (prisma as any).order.count({
      where: {
        status: 'PAID',
        produto: { vendorId: vendor.id }
      }
    }),
    (prisma as any).commission.aggregate({
      where: { vendorId: vendor.id },
      _sum: { vendorAmount: true, platformFee: true, affiliateAmount: true }
    })
  ])

  const vendorAmount = Number((commissionAgg as any)?._sum?.vendorAmount ?? 0)
  const platformFee = Number((commissionAgg as any)?._sum?.platformFee ?? 0)
  const affiliateAmount = Number((commissionAgg as any)?._sum?.affiliateAmount ?? 0)

  return {
    ok: true,
    vendor,
    totals: {
      productsCount,
      salesCount,
      vendorAmount,
      platformFee,
      affiliateAmount,
      payoutBalance: vendorAmount
    }
  }
})
