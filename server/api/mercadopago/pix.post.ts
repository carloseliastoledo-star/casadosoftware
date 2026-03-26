import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import prisma from '../../db/prisma.js'
import { getMpPayment } from '../../utils/mercadopago.js'
import { getStoreContext } from '../../utils/store'

export default defineEventHandler(async (event) => {
  const country = String(getCookie(event, 'ld_country') || '').trim().toUpperCase()

  if (country && country !== 'BR') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Mercado Pago disponível apenas no Brasil'
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
    console.error('[pix] effectivePrice inválido:', {
      produtoId,
      effectivePriceRaw,
      effectivePrice
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Preço inválido para o produto'
    })
  }

  const reuseWindowMs = 60 * 60 * 1000
  const reuseAfter = new Date(Date.now() - reuseWindowMs)
  const normalizedCouponCode = String(couponCode || '').trim().toUpperCase()

  // Idempotency check OUTSIDE transaction — avoids PostgreSQL aborted-transaction state
  const existingCustomer = await (prisma as any).customer.findUnique({
    where: { email_storeSlug: { email, storeSlug } },
    select: { id: true }
  })

  if (existingCustomer && !normalizedCouponCode) {
    const existingOrder = await (prisma as any).order.findFirst({
      where: {
        status: 'PENDING',
        storeSlug,
        customerId: existingCustomer.id,
        produtoId: produto.id,
        cupomId: null,
        criadoEm: { gte: reuseAfter }
      },
      orderBy: { criadoEm: 'desc' },
      select: { id: true, totalAmount: true, mercadoPagoPaymentId: true }
    })

    if (existingOrder) {
      const existingMpId = String(existingOrder.mercadoPagoPaymentId || '').trim()
      if (existingMpId) {
        try {
          const payment = getMpPayment()
          const mpPayment = await payment.get({ id: existingMpId })
          const qrCode = (mpPayment as any)?.point_of_interaction?.transaction_data?.qr_code || null
          const qrCodeBase64Raw = (mpPayment as any)?.point_of_interaction?.transaction_data?.qr_code_base64 || null
          if (qrCode) {
            return { ok: true, orderId: existingOrder.id, paymentId: existingMpId, qrCode, qrCodeBase64: qrCodeBase64Raw ? `data:image/png;base64,${qrCodeBase64Raw}` : null }
          }
        } catch {
          // reuse failed, will create new payment below
        }
      }
      // reuse order but create new MP payment
      const payment = getMpPayment()
      const reusedResult = await payment.create({
        body: {
          transaction_amount: Number(existingOrder.totalAmount),
          description: produto.nome,
          payment_method_id: 'pix',
          payer: { email },
          metadata: { orderId: existingOrder.id, produtoId: produto.id },
          external_reference: existingOrder.id
        }
      })
      const newMpId = String((reusedResult as any)?.id || '').trim()
      if (newMpId) {
        await (prisma as any).order.update({ where: { id: existingOrder.id }, data: { mercadoPagoPaymentId: newMpId } })
      }
      const qrCode2 = (reusedResult as any)?.point_of_interaction?.transaction_data?.qr_code || null
      const qrCodeBase64Raw2 = (reusedResult as any)?.point_of_interaction?.transaction_data?.qr_code_base64 || null
      return { ok: true, orderId: existingOrder.id, paymentId: newMpId, qrCode: qrCode2, qrCodeBase64: qrCodeBase64Raw2 ? `data:image/png;base64,${qrCodeBase64Raw2}` : null }
    }
  }

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
    const normalizedCode = normalizedCouponCode

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
        throw createError({
          statusCode: 404,
          statusMessage: 'Cupom inválido'
        })
      }

      if (!c.active) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cupom inativo'
        })
      }

      const now = new Date()

      if (c.startsAt && c.startsAt > now) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cupom ainda não está válido'
        })
      }

      if (c.expiresAt && c.expiresAt < now) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cupom expirado'
        })
      }

      if (c.maxUses !== null && c.maxUses !== undefined && c.usedCount >= c.maxUses) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cupom esgotado'
        })
      }

      const percent = Number(c.percent)

      if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Cupom inválido'
        })
      }

      coupon = {
        id: c.id,
        code: c.code,
        percent
      }
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
      console.error('[pix] totalAmount inválido:', {
        subtotalAmount,
        pixDiscountAmount,
        couponDiscountAmount,
        totalAmount
      })

      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao calcular total do pedido'
      })
    }

    if (coupon) {
      await tx.cupom.update({
        where: { id: coupon.id },
        data: {
          usedCount: {
            increment: 1
          }
        }
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

  const payment = getMpPayment()

  const existingMpPaymentId = String((order as any)?.mercadoPagoPaymentId || '').trim()

  if (reused && existingMpPaymentId) {
    try {
      console.log('[pix] Tentando reutilizar pagamento existente:', {
        orderId: (order as any).id,
        paymentId: existingMpPaymentId
      })

      const mpPayment = await payment.get({ id: existingMpPaymentId })

      const qrCode =
        (mpPayment as any)?.point_of_interaction?.transaction_data?.qr_code || null

      const qrCodeBase64Raw =
        (mpPayment as any)?.point_of_interaction?.transaction_data?.qr_code_base64 || null

      console.log('[pix] Reutilização de PIX bem-sucedida:', {
        orderId: (order as any).id,
        paymentId: existingMpPaymentId,
        hasQrCode: Boolean(qrCode),
        hasQrCodeBase64: Boolean(qrCodeBase64Raw)
      })

      return {
        ok: true,
        orderId: (order as any).id,
        paymentId: existingMpPaymentId,
        qrCode,
        qrCodeBase64: qrCodeBase64Raw ? `data:image/png;base64,${qrCodeBase64Raw}` : null
      }
    } catch (reuseErr: any) {
      console.error('[pix] Falha ao reutilizar pagamento existente:', JSON.stringify({
        orderId: (order as any)?.id,
        paymentId: existingMpPaymentId,
        message: reuseErr?.message,
        status: reuseErr?.status || reuseErr?.statusCode,
        cause: reuseErr?.cause,
        body: reuseErr?.body
      }, null, 2))
    }
  }

  const transactionAmount = Number((order as any)?.totalAmount)

  if (!Number.isFinite(transactionAmount) || transactionAmount <= 0) {
    console.error('[pix] transactionAmount inválido:', {
      orderId: (order as any)?.id,
      rawTotalAmount: (order as any)?.totalAmount,
      transactionAmount
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Valor inválido para pagamento'
    })
  }

  let result: any

  console.log('[pix] Dados enviados ao Mercado Pago:', JSON.stringify({
    orderId: (order as any)?.id,
    produtoId: produto.id,
    produtoNome: produto.nome,
    transactionAmount,
    email,
    nome,
    whatsapp,
    cpf,
    couponCode: coupon?.code || null,
    couponPercent: coupon?.percent || null,
    storeSlug
  }, null, 2))

  try {
    result = await payment.create({
      body: {
        transaction_amount: transactionAmount,
        description: produto.nome,
        payment_method_id: 'pix',
        payer: {
          email
        },
        metadata: {
          orderId: (order as any).id,
          produtoId: produto.id,
          nome: nome || null,
          whatsapp: whatsapp || null,
          cpf: cpf || null,
          pixDiscountPercent: 5,
          couponCode: coupon?.code || null,
          couponPercent: coupon?.percent || null
        },
        external_reference: (order as any).id
      }
    })

    console.log('[pix] Mercado Pago payment.create sucesso:', JSON.stringify({
      id: (result as any)?.id,
      status: (result as any)?.status,
      status_detail: (result as any)?.status_detail,
      payment_method_id: (result as any)?.payment_method_id,
      payment_type_id: (result as any)?.payment_type_id,
      hasQrCode: Boolean((result as any)?.point_of_interaction?.transaction_data?.qr_code),
      hasQrCodeBase64: Boolean((result as any)?.point_of_interaction?.transaction_data?.qr_code_base64)
    }, null, 2))
  } catch (mpErr: any) {
    console.error('[pix] Mercado Pago payment.create error:', JSON.stringify({
      orderId: (order as any)?.id,
      produtoId: produto.id,
      transactionAmount,
      email,
      message: mpErr?.message,
      status: mpErr?.status || mpErr?.statusCode,
      cause: mpErr?.cause,
      apiError: mpErr?.error,
      body: mpErr?.body
    }, null, 2))

    const detail =
      mpErr?.cause?.[0]?.description ||
      mpErr?.body?.message ||
      mpErr?.message ||
      'Erro desconhecido'

    throw createError({
      statusCode: 502,
      statusMessage: `Mercado Pago: ${detail}`
    })
  }

  const mpPaymentId = String((result as any)?.id || '').trim()

  if (!mpPaymentId) {
    console.error('[pix] Mercado Pago retornou sem payment id:', JSON.stringify(result, null, 2))

    throw createError({
      statusCode: 502,
      statusMessage: 'Falha ao criar pagamento no Mercado Pago'
    })
  }

  const paymentTypeId = (result as any)?.payment_type_id
  const paymentMethodId = (result as any)?.payment_method_id

  await (prisma as any).order.update({
    where: { id: (order as any).id },
    data: {
      mercadoPagoPaymentId: mpPaymentId,
      mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
      mercadoPagoPaymentMethodId: paymentMethodId ? String(paymentMethodId) : null
    }
  })

  const qrCode =
    (result as any)?.point_of_interaction?.transaction_data?.qr_code || null

  const qrCodeBase64Raw =
    (result as any)?.point_of_interaction?.transaction_data?.qr_code_base64 || null

  return {
    ok: true,
    orderId: (order as any).id,
    paymentId: mpPaymentId,
    qrCode,
    qrCodeBase64: qrCodeBase64Raw ? `data:image/png;base64,${qrCodeBase64Raw}` : null
  }
})