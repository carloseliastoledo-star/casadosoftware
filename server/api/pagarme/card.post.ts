import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import prisma from '../../db/prisma.js'
import { createPagarmeCard } from '../../services/pagarme.js'
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

  const cardNumber = String(body?.card_number || '').replace(/\s/g, '')
  const cardHolderName = String(body?.card_holder_name || '').trim()
  const cardExpMonth = Number(body?.card_exp_month || 0)
  const cardExpYear = Number(body?.card_exp_year || 0)
  const cardCvv = String(body?.card_cvv || '').trim()
  const installments = Number(body?.installments || 1)

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
    const medium = String(utmMedium || '').trim().toLowerCase()
    if (gclid || medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paidsearch') return 'cpc'
    if (medium === 'organic') return 'organic'
    const ref = String(referrer || '').trim().toLowerCase()
    if (!ref) return 'direct'
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('duckduckgo.') || ref.includes('yandex.')) return 'organic'
    return 'referral'
  }

  const trafficSourceType = inferTrafficSourceType()

  if (!storeSlug) throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
  if (!produtoId) throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  if (!cardNumber || cardNumber.length < 13) throw createError({ statusCode: 400, statusMessage: 'Número do cartão inválido' })
  if (!cardHolderName) throw createError({ statusCode: 400, statusMessage: 'Nome no cartão obrigatório' })
  if (!cardExpMonth || cardExpMonth < 1 || cardExpMonth > 12) throw createError({ statusCode: 400, statusMessage: 'Mês de validade inválido' })
  if (!cardExpYear || cardExpYear < 2024) throw createError({ statusCode: 400, statusMessage: 'Ano de validade inválido' })
  if (!cardCvv || cardCvv.length < 3) throw createError({ statusCode: 400, statusMessage: 'CVV inválido' })

  const cpfClean = String(cpf || '').replace(/\D/g, '')
  if (cpfClean.length !== 11) throw createError({ statusCode: 400, statusMessage: 'CPF inválido' })

  const round2 = (n: number) => Math.round(n * 100) / 100

  const produto = await (prisma as any).produto.findUnique({
    where: { id: produtoId },
    select: {
      id: true,
      nome: true,
      preco: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true }
      }
    }
  })

  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const priceOverride = (produto as any).precosLoja?.[0] || null
  const effectivePrice = Number(priceOverride?.preco ?? (produto as any).preco)

  if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    throw createError({ statusCode: 500, statusMessage: 'Preço inválido para o produto' })
  }

  const normalizedCouponCode = String(couponCode || '').trim().toUpperCase()

  const { customer, order, coupon } = await (prisma as any).$transaction(async (tx: any) => {
    let affiliateId: number | null = null
    if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
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

    if (!normalizedCouponCode) {
      const existing = await tx.order.findFirst({
        where: {
          status: 'PENDING',
          storeSlug,
          customerId: customer.id,
          produtoId: produto.id,
          cupomId: null,
          criadoEm: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        },
        orderBy: { criadoEm: 'desc' },
        select: { id: true, totalAmount: true }
      })
      if (existing) {
        return { customer, order: existing, coupon: null }
      }
    }

    let coupon: { id: string; code: string; percent: number } | null = null
    if (normalizedCouponCode) {
      const c = await tx.cupom.findUnique({
        where: { code: normalizedCouponCode },
        select: { id: true, code: true, percent: true, active: true, startsAt: true, expiresAt: true, maxUses: true, usedCount: true }
      })
      if (!c) throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
      if (!c.active) throw createError({ statusCode: 400, statusMessage: 'Cupom inativo' })
      const now = new Date()
      if (c.startsAt && c.startsAt > now) throw createError({ statusCode: 400, statusMessage: 'Cupom ainda não está válido' })
      if (c.expiresAt && c.expiresAt < now) throw createError({ statusCode: 400, statusMessage: 'Cupom expirado' })
      if (c.maxUses !== null && c.maxUses !== undefined && c.usedCount >= c.maxUses) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom esgotado' })
      }
      const percent = Number(c.percent)
      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom inválido' })
      }
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

    return { customer, order, coupon }
  })

  const transactionAmount = Number(order.totalAmount)
  if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
    throw createError({ statusCode: 500, statusMessage: 'Valor inválido para pagamento' })
  }

  let result: any
  try {
    result = await createPagarmeCard({
      orderId: order.id,
      amountBrl: transactionAmount,
      installments,
      customer: {
        name: nome || email.split('@')[0],
        email,
        document: cpfClean,
        document_type: 'CPF',
        type: 'individual'
      },
      card: {
        number: cardNumber,
        holder_name: cardHolderName,
        exp_month: cardExpMonth,
        exp_year: cardExpYear,
        cvv: cardCvv
      }
    })
  } catch (err: any) {
    const msg = String(err?.data?.message || err?.message || 'Falha no pagamento').trim()
    throw createError({ statusCode: 502, statusMessage: msg || 'Erro ao processar cartão no Pagar.me' })
  }

  const chargeId = String(result?.charge_id || '').trim()
  const status = String(result?.status || '').toLowerCase()
  const paid = status === 'paid'

  await (prisma as any).order.update({
    where: { id: order.id },
    data: {
      pagarmeChargeId: chargeId || null,
      status: paid ? 'PAID' : 'PENDING',
      pagoEm: paid ? new Date() : null
    }
  })

  return {
    ok: true,
    orderId: order.id,
    paymentId: chargeId,
    status: paid ? 'approved' : 'pending'
  }
})
