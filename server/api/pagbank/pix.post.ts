import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import prisma from '../../db/prisma.js'
import { createPagbankPix } from '../../services/pagbank.js'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext(event)
  const body = await readBody(event)

  const affiliateRef = String(getCookie(event, 'affiliate_ref') || '').trim()

  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = body?.nome ? String(body.nome).trim() : undefined
  const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : undefined
  const cpf = body?.cpf ? String(body.cpf).trim() : undefined
  const couponCode = body?.couponCode ? String(body.couponCode).trim() : ''

  const utmSource = body?.utm_source ? String(body.utm_source).trim() : undefined
  const utmMedium = body?.utm_medium ? String(body.utm_medium).trim() : undefined
  const utmCampaign = body?.utm_campaign ? String(body.utm_campaign).trim() : undefined
  const utmTerm = body?.utm_term ? String(body.utm_term).trim() : undefined
  const utmContent = body?.utm_content ? String(body.utm_content).trim() : undefined
  const gclid = body?.gclid ? String(body.gclid).trim() : undefined
  const fbclid = body?.fbclid ? String(body.fbclid).trim() : undefined
  const referrer = body?.referrer ? String(body.referrer).trim() : undefined
  const landingPage = body?.landingPage ? String(body.landingPage).trim() : undefined

  function inferTrafficSourceType(): string {
    const medium = String(utmMedium || '').toLowerCase()
    if (gclid || medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paidsearch') return 'cpc'
    if (medium === 'organic') return 'organic'
    const ref = String(referrer || '').toLowerCase()
    if (!ref) return 'direct'
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('duckduckgo.')) return 'organic'
    return 'referral'
  }

  if (!storeSlug) throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
  if (!produtoId) throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })

  const cpfClean = String(cpf || '').replace(/\D/g, '')
  if (cpfClean.length !== 11) throw createError({ statusCode: 400, statusMessage: 'CPF inválido' })

  const round2 = (n: number) => Math.round(n * 100) / 100

  const produto = await (prisma as any).produto.findUnique({
    where: { id: produtoId },
    select: {
      id: true, nome: true, preco: true,
      precosLoja: { where: { storeSlug: storeSlug || undefined }, select: { preco: true } }
    }
  })
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const effectivePrice = Number((produto as any).precosLoja?.[0]?.preco ?? (produto as any).preco)
  if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    throw createError({ statusCode: 500, statusMessage: 'Preço inválido' })
  }

  const normalizedCoupon = String(couponCode || '').trim().toUpperCase()
  const trafficSourceType = inferTrafficSourceType()

  // Idempotência: verificar pedido recente antes da transação
  const reuseWindowMs = 10 * 60 * 1000
  const reuseAfter = new Date(Date.now() - reuseWindowMs)

  if (!normalizedCoupon) {
    const existing = await (prisma as any).order.findFirst({
      where: {
        status: 'PENDING',
        storeSlug,
        produtoId: produto.id,
        cupomId: null,
        criadoEm: { gte: reuseAfter },
        customer: { email, storeSlug }
      },
      orderBy: { criadoEm: 'desc' },
      select: { id: true, totalAmount: true, pagbankChargeId: true, customer: { select: { email: true } } }
    })

    if (existing?.pagbankChargeId) {
      return {
        ok: true,
        orderId: existing.id,
        chargeId: existing.pagbankChargeId,
        reused: true
      }
    }
  }

  const { order, coupon } = await (prisma as any).$transaction(async (tx: any) => {
    let affiliateId: number | null = null
    if (String(process.env.AFFILIATE_ENABLED || '').toLowerCase() === 'true') {
      const code = String(affiliateRef || '').trim()
      if (code) {
        const found = await tx.affiliate.findUnique({ where: { refCode: code }, select: { id: true } })
        affiliateId = found?.id ?? null
      }
    }

    const customer = await tx.customer.upsert({
      where: { email_storeSlug: { email, storeSlug } },
      create: { email, storeSlug, nome: nome || null, whatsapp: whatsapp || null, cpf: cpf || null },
      update: { nome: nome || undefined, whatsapp: whatsapp || undefined, cpf: cpf || undefined }
    })

    let coupon: { id: string; code: string; percent: number } | null = null
    if (normalizedCoupon) {
      const c = await tx.cupom.findUnique({
        where: { code: normalizedCoupon },
        select: { id: true, code: true, percent: true, active: true, startsAt: true, expiresAt: true, maxUses: true, usedCount: true }
      })
      if (!c) throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
      if (!c.active) throw createError({ statusCode: 400, statusMessage: 'Cupom inativo' })
      const now = new Date()
      if (c.startsAt && c.startsAt > now) throw createError({ statusCode: 400, statusMessage: 'Cupom ainda não válido' })
      if (c.expiresAt && c.expiresAt < now) throw createError({ statusCode: 400, statusMessage: 'Cupom expirado' })
      if (c.maxUses !== null && c.usedCount >= c.maxUses) throw createError({ statusCode: 400, statusMessage: 'Cupom esgotado' })
      const percent = Number(c.percent)
      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) throw createError({ statusCode: 400, statusMessage: 'Cupom inválido' })
      coupon = { id: c.id, code: c.code, percent }
      await tx.cupom.update({ where: { id: c.id }, data: { usedCount: { increment: 1 } } })
    }

    const subtotalAmount = round2(effectivePrice)
    const couponDiscountAmount = coupon ? round2(subtotalAmount * (coupon.percent / 100)) : 0
    const totalAmount = Math.max(0, round2(subtotalAmount - couponDiscountAmount))

    const order = await tx.order.create({
      data: {
        status: 'PENDING',
        storeSlug,
        affiliateId: affiliateId ?? null,
        trafficSourceType,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null,
        utmTerm: utmTerm || null,
        utmContent: utmContent || null,
        gclid: gclid || null,
        fbclid: fbclid || null,
        referrer: referrer || null,
        landingPage: landingPage || null,
        produtoId: produto.id,
        customerId: customer.id,
        cupomId: coupon?.id || null,
        subtotalAmount,
        pixDiscountPercent: 0,
        pixDiscountAmount: 0,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null,
        couponDiscountAmount: coupon ? couponDiscountAmount : null,
        totalAmount
      }
    })

    return { order, coupon }
  })

  const totalAmount = Number(order.totalAmount)

  let result: any
  try {
    result = await createPagbankPix({
      orderId: order.id,
      amountBrl: totalAmount,
      description: (produto as any).nome,
      customer: {
        name: nome || email.split('@')[0],
        email,
        document: cpfClean
      }
    })
  } catch (err: any) {
    const msg = String(err?.message || 'Erro ao gerar PIX no PagBank')
    throw createError({ statusCode: 502, statusMessage: msg })
  }

  await (prisma as any).order.update({
    where: { id: order.id },
    data: { pagbankChargeId: result.charge_id || null }
  })

  return {
    ok: true,
    orderId: order.id,
    chargeId: result.charge_id,
    qrCode: result.qr_code_text,
    qrCodeUrl: result.qr_code_png_url,
    expiresAt: result.expires_at
  }
})
