import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import prisma from '../../db/prisma.js'
import { createPagarmePix, getPagarmeCharge } from '../../services/pagarme'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const country = String(getCookie(event, 'ld_country') || '').trim().toUpperCase()

  if (country && country !== 'BR') {
    throw createError({
      statusCode: 403,
      statusMessage: 'PIX disponível apenas no Brasil'
    })
  }

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
    const medium = String(utmMedium || '').trim().toLowerCase()

    if (
      gclid ||
      medium === 'cpc' ||
      medium === 'ppc' ||
      medium === 'paid' ||
      medium === 'paidsearch'
    ) {
      return 'cpc'
    }

    if (medium === 'organic') {
      return 'organic'
    }

    const ref = String(referrer || '').trim().toLowerCase()

    if (!ref) {
      return 'direct'
    }

    if (
      ref.includes('google.') ||
      ref.includes('bing.') ||
      ref.includes('yahoo.') ||
      ref.includes('duckduckgo.') ||
      ref.includes('yandex.')
    ) {
      return 'organic'
    }

    return 'referral'
  }

  const trafficSourceType = inferTrafficSourceType()

  if (!storeSlug) {
    throw createError({
      statusCode: 500,
      statusMessage: 'STORE_SLUG não configurado'
    })
  }

  if (!produtoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'produtoId obrigatório'
    })
  }

  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido'
    })
  }

  const cpfClean = String(cpf || '').replace(/\D/g, '')
  if (!cpfClean || cpfClean.length < 11) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CPF obrigatório para pagamento PIX'
    })
  }

  const round2 = (n: number) => Math.round(n * 100) / 100

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
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }

  const priceOverride = (produto as any).precosLoja?.[0] || null
  const effectivePriceRaw = priceOverride?.preco ?? (produto as any).preco
  const effectivePrice = Number(effectivePriceRaw)

  if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Preço inválido para o produto'
    })
  }

  const reuseWindowMs = 10 * 60 * 1000
  const reuseAfter = new Date(Date.now() - reuseWindowMs)

  const { customer, order, coupon, reused } = await (prisma as any).$transaction(async (tx: any) => {
    let affiliateId: number | null = null

    if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
      const code = String(affiliateRef || '').trim()

      if (code) {
        const found = await tx.affiliate.findUnique({
          where: { refCode: code },
          select: { id: true }
        })

        affiliateId = found?.id ?? null
      }
    }

    const customer = await tx.customer.upsert({
      where: {
        email_storeSlug: {
          email,
          storeSlug
        }
      },
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

    if (!normalizedCode) {
      try {
        await tx.$queryRaw`SELECT id FROM Customer WHERE id = ${customer.id} FOR UPDATE`
      } catch {
        // fallback sem lock
      }

      const existing = await tx.order.findFirst({
        where: {
          status: 'PENDING',
          storeSlug,
          customerId: customer.id,
          produtoId: produto.id,
          cupomId: null,
          criadoEm: { gte: reuseAfter }
        },
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          totalAmount: true,
          pagarmeChargeId: true
        }
      })

      if (existing) {
        return {
          customer,
          order: existing,
          coupon: null,
          reused: true
        }
      }
    }

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

      if (!c) {
        throw createError({ statusCode: 404, statusMessage: 'Cupom inválido' })
      }

      if (!c.active) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom inativo' })
      }

      const now = new Date()

      if (c.startsAt && c.startsAt > now) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom ainda não está válido' })
      }

      if (c.expiresAt && c.expiresAt < now) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom expirado' })
      }

      if (c.maxUses !== null && c.maxUses !== undefined && c.usedCount >= c.maxUses) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom esgotado' })
      }

      const percent = Number(c.percent)

      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw createError({ statusCode: 400, statusMessage: 'Cupom inválido' })
      }

      coupon = { id: c.id, code: c.code, percent }
    }

    const subtotalAmount = round2(effectivePrice)
    const pixDiscountPercent = 5
    const pixDiscountAmount = round2(subtotalAmount * 0.05)
    const couponDiscountAmount = coupon
      ? round2(subtotalAmount * (coupon.percent / 100))
      : 0

    const totalAmount = Math.max(
      0,
      round2(subtotalAmount - pixDiscountAmount - couponDiscountAmount)
    )

    if (!Number.isFinite(totalAmount)) {
      throw createError({ statusCode: 500, statusMessage: 'Erro ao calcular total do pedido' })
    }

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
        pixDiscountPercent,
        pixDiscountAmount,
        couponCode: coupon?.code || null,
        couponPercent: coupon?.percent || null,
        couponDiscountAmount: coupon ? couponDiscountAmount : null,
        totalAmount
      }
    })

    return {
      customer,
      order,
      coupon,
      reused: false
    }
  })

  console.log('[pagarme-pix] Transação concluída:', JSON.stringify({
    orderId: (order as any)?.id,
    storeSlug: (order as any)?.storeSlug,
    reused,
    customerId: (customer as any)?.id,
    totalAmount: (order as any)?.totalAmount
  }))

  // Se reutilizando order com charge existente, verificar status
  const existingChargeId = String((order as any)?.pagarmeChargeId || '').trim()

  if (reused && existingChargeId) {
    try {
      console.log('[pagarme-pix] Reutilizando charge existente:', {
        orderId: (order as any).id,
        chargeId: existingChargeId
      })

      const charge = await getPagarmeCharge(existingChargeId)
      const lastTx = charge?.last_transaction || charge

      const qrCode = lastTx?.qr_code || ''
      const qrCodeUrl = lastTx?.qr_code_url || ''

      if (qrCode) {
        return {
          ok: true,
          orderId: (order as any).id,
          paymentId: existingChargeId,
          qrCode,
          qrCodeBase64: null,
          qrCodeUrl
        }
      }
    } catch (reuseErr: any) {
      console.error('[pagarme-pix] Falha ao reutilizar charge:', reuseErr?.message)
    }
  }

  const transactionAmount = Number((order as any)?.totalAmount)

  if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Valor inválido para pagamento'
    })
  }

  console.log('[pagarme-pix] Criando charge:', JSON.stringify({
    orderId: (order as any)?.id,
    produtoId: produto.id,
    transactionAmount,
    email,
    cpfClean
  }))

  let result: any

  try {
    const whatsDigits = String(whatsapp || '').replace(/\D/g, '')
    const mobilePhone = whatsDigits.length >= 10
      ? {
          country_code: '55',
          area_code: whatsDigits.slice(0, 2),
          number: whatsDigits.slice(2)
        }
      : undefined

    result = await createPagarmePix({
      orderId: (order as any).id,
      amountBrl: transactionAmount,
      description: produto.nome,
      customer: {
        name: nome || email.split('@')[0],
        email,
        document: cpfClean,
        document_type: 'CPF',
        type: 'individual',
        ...(mobilePhone ? { phones: { mobile_phone: mobilePhone } } : {})
      },
      expiresInSeconds: 3600
    })

    console.log('[pagarme-pix] Charge criada com sucesso:', JSON.stringify({
      chargeId: result.charge_id,
      hasQrCode: Boolean(result.qr_code),
      hasQrCodeUrl: Boolean(result.qr_code_url)
    }))
  } catch (pgErr: any) {
    console.error('[pagarme-pix] Erro ao criar charge:', JSON.stringify({
      orderId: (order as any)?.id,
      message: pgErr?.message,
      status: pgErr?.status || pgErr?.statusCode,
      data: pgErr?.data
    }, null, 2))

    const detail = pgErr?.data?.message || pgErr?.message || 'Erro desconhecido'

    throw createError({
      statusCode: 502,
      statusMessage: `Pagar.me: ${detail}`
    })
  }

  if (!result.charge_id) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Falha ao criar pagamento no Pagar.me'
    })
  }

  await (prisma as any).order.update({
    where: { id: (order as any).id },
    data: {
      pagarmeChargeId: result.charge_id
    }
  })

  return {
    ok: true,
    orderId: (order as any).id,
    paymentId: result.charge_id,
    qrCode: result.qr_code || '',
    qrCodeBase64: null,
    qrCodeUrl: result.qr_code_url || ''
  }
})
