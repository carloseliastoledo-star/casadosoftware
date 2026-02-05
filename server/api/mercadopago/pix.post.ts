import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '../../db/prisma.js'
import { getMpPayment } from '../../utils/mercadopago.js'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const { storeSlug } = getStoreContext()
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = body?.nome ? String(body.nome).trim() : undefined
  const whatsapp = body?.whatsapp ? String(body.whatsapp).trim() : undefined
  const cpf = body?.cpf ? String(body.cpf).trim() : undefined
  const couponCode = body?.couponCode ? String(body.couponCode) : ''

  const utmSource = body?.utm_source ? String(body.utm_source) : undefined
  const utmMedium = body?.utm_medium ? String(body.utm_medium) : undefined
  const utmCampaign = body?.utm_campaign ? String(body.utm_campaign) : undefined
  const utmTerm = body?.utm_term ? String(body.utm_term) : undefined
  const utmContent = body?.utm_content ? String(body.utm_content) : undefined
  const gclid = body?.gclid ? String(body.gclid) : undefined
  const fbclid = body?.fbclid ? String(body.fbclid) : undefined
  const referrer = body?.referrer ? String(body.referrer) : undefined
  const landingPage = body?.landingPage ? String(body.landingPage) : undefined

  function inferTrafficSourceType(): string {
    const medium = String(utmMedium || '').trim().toLowerCase()
    if (gclid || medium === 'cpc' || medium === 'ppc' || medium === 'paid' || medium === 'paidsearch') return 'cpc'
    if (medium === 'organic') return 'organic'
    const ref = String(referrer || '').trim().toLowerCase()
    if (!ref) return 'direct'
    if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || ref.includes('duckduckgo.') || ref.includes('yandex.')) {
      return 'organic'
    }
    return 'referral'
  }

  const trafficSourceType = inferTrafficSourceType()

  if (!produtoId) {
    throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  }

  if (!email || !email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  }

  const produto = await (prisma as any).produto.findUnique({
    where: { id: produtoId },
    select: {
      id: true,
      nome: true,
      preco: true,
      precoAntigo: true,
      precosLoja: {
        where: { storeSlug: storeSlug || undefined },
        select: { preco: true, precoAntigo: true }
      }
    }
  })
  if (!produto) {
    throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })
  }

  const priceOverride = (produto as any).precosLoja?.[0] || null
  const effectivePrice = priceOverride?.preco ?? (produto as any).preco

  if (!storeSlug) {
    throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
  }

  const round2 = (n: number) => Math.round(n * 100) / 100

  const { customer, order, coupon } = await (prisma as any).$transaction(async (tx: any) => {
    const customer = await tx.customer.upsert({
      where: { email_storeSlug: { email, storeSlug } },
      create: {
        email,
        storeSlug,
        nome: nome || null,
        whatsapp: whatsapp || null,
        cpf: cpf || null
      },
      update: {
        nome: nome || undefined,
        whatsapp: whatsapp || undefined,
        cpf: cpf || undefined
      }
    })

    let coupon: { id: string; code: string; percent: number } | null = null
    const normalizedCode = String(couponCode || '').trim().toUpperCase()
    if (normalizedCode) {
      const c = await tx.cupom.findUnique({
        where: { code: normalizedCode },
        select: {
          id: true,
          code: true,
          percent: true,
          active: true,
          startsAt: true,
          expiresAt: true,
          maxUses: true,
          usedCount: true
        }
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
    }

    const subtotalAmount = round2(Number(effectivePrice))
    const pixDiscountPercent = 5
    const pixDiscountAmount = round2(subtotalAmount * 0.05)
    const couponDiscountAmount = coupon ? round2(subtotalAmount * (coupon.percent / 100)) : 0
    const totalAmount = Math.max(0, round2(subtotalAmount - pixDiscountAmount - couponDiscountAmount))

    if (coupon) {
      await tx.cupom.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } }
      })
    }

    const order = await tx.order.create({
      data: {
        status: 'PENDING',
        storeSlug,
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
        pixDiscountPercent,
        pixDiscountAmount,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null,
        couponDiscountAmount: coupon ? couponDiscountAmount : null,
        totalAmount
      }
    })

    return { customer, order, coupon }
  })

  const payment = getMpPayment()

  const transactionAmount = Number(order.totalAmount ?? Number(effectivePrice))

  const result = await payment.create({
    body: {
      transaction_amount: transactionAmount,
      description: produto.nome,
      payment_method_id: 'pix',
      payer: {
        email
      },
      metadata: {
        orderId: order.id,
        produtoId: produto.id,
        nome,
        whatsapp,
        cpf,
        pixDiscountPercent: 5,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null
      },
      external_reference: order.id
    }
  })

  const mpPaymentId = String((result as any)?.id || '')
  if (!mpPaymentId) {
    throw createError({ statusCode: 502, statusMessage: 'Falha ao criar pagamento no Mercado Pago' })
  }

  const paymentTypeId = (result as any)?.payment_type_id
  const paymentMethodId = (result as any)?.payment_method_id

  await (prisma as any).order.update({
    where: { id: order.id },
    data: {
      mercadoPagoPaymentId: mpPaymentId,
      mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
      mercadoPagoPaymentMethodId: paymentMethodId ? String(paymentMethodId) : null
    }
  })

  const qrCode = (result as any)?.point_of_interaction?.transaction_data?.qr_code
  const qrCodeBase64 = (result as any)?.point_of_interaction?.transaction_data?.qr_code_base64

  return {
    ok: true,
    orderId: order.id,
    paymentId: mpPaymentId,
    qrCode,
    qrCodeBase64: qrCodeBase64 ? `data:image/png;base64,${qrCodeBase64}` : null
  }
})
