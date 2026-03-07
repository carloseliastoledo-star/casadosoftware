import prisma from '../db/prisma'

function feeRate(): number {
  const raw = String(process.env.PLATFORM_FEE_RATE || '').trim()
  const n = raw === '' ? 0 : Number(raw)
  if (!Number.isFinite(n) || n < 0) return 0
  if (n > 1) return 1
  return n
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

export async function ensureMarketplaceCommissionForOrder(orderId: string) {
  const id = String(orderId || '').trim()
  if (!id) return { ok: false as const, reason: 'missing_order_id' as const }

  const existing = await (prisma as any).commission.findUnique({
    where: { orderId: id },
    select: { id: true }
  })
  if (existing) return { ok: true as const, created: false as const }

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      affiliateId: true,
      produto: {
        select: {
          id: true,
          vendorId: true,
          preco: true
        }
      },
      affiliate: {
        select: {
          id: true,
          commissionRate: true
        }
      }
    }
  })

  if (!order) return { ok: false as const, reason: 'order_not_found' as const }

  const status = String(order.status || '').toUpperCase()
  if (status !== 'PAID') return { ok: false as const, reason: 'order_not_paid' as const }

  const vendorId = String(order.produto?.vendorId || '').trim()
  if (!vendorId) return { ok: false as const, reason: 'no_vendor' as const }

  const total = Number(order.totalAmount ?? order.produto?.preco ?? 0)
  const platformFee = round2(total * feeRate())

  const affiliateRate = Number(order.affiliate?.commissionRate ?? 0)
  const affiliateAmount = order.affiliateId ? round2(total * affiliateRate) : 0

  const vendorAmount = Math.max(0, round2(total - platformFee - affiliateAmount))

  await (prisma as any).commission.create({
    data: {
      orderId: order.id,
      affiliateId: order.affiliateId || null,
      vendorId,
      platformFee,
      vendorAmount,
      affiliateAmount
    },
    select: { id: true }
  })

  return { ok: true as const, created: true as const }
}
