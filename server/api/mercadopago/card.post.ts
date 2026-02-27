import { defineEventHandler, readBody, createError, getCookie } from 'h3'
import prisma from '../../db/prisma.js'
import { getMpPayment } from '../../utils/mercadopago.js'
import { processMercadoPagoPayment } from '../../utils/mercadopagoWebhook.js'
import { getStoreContext } from '../../utils/store'

function formatMpError(err: any) {
  const status = err?.status ?? err?.statusCode
  const message = String(err?.message || err?.name || '').trim()
  const apiMessage = String(err?.cause?.[0]?.description || err?.cause?.[0]?.message || '').trim()
  const apiError = String(err?.cause?.[0]?.code || err?.error || '').trim()
  const detail = apiMessage || message

  const meta: string[] = []
  if (typeof status === 'number') meta.push(`http=${status}`)
  if (apiError) meta.push(`code=${apiError}`)

  return {
    detail,
    meta: meta.length ? ` (${meta.join(' ')})` : ''
  }
}

export default defineEventHandler(async (event) => {
  const country = String(getCookie(event, 'ld_country') || '').trim().toUpperCase()
  if (country && country !== 'BR') {
    throw createError({ statusCode: 403, statusMessage: 'Mercado Pago disponível apenas no Brasil' })
  }

  const { storeSlug } = getStoreContext(event)
  const body = await readBody(event)

  const produtoId = String(body?.produtoId || '')
  const email = String(body?.email || '').trim().toLowerCase()

  const couponCode = body?.couponCode ? String(body.couponCode) : ''

  const token = String(body?.token || '')
  const paymentMethodId = String(body?.payment_method_id || '')
  const issuerId = body?.issuer_id ? String(body.issuer_id) : undefined
  const installments = Number(body?.installments || 1)

  const issuerIdNumber = issuerId ? Number(issuerId) : undefined

  const identificationType = String(body?.identification?.type || 'CPF')
  const identificationNumber = String(body?.identification?.number || '')

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

  if (!produtoId) throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })

  if (!token) throw createError({ statusCode: 400, statusMessage: 'token obrigatório' })
  if (!paymentMethodId) throw createError({ statusCode: 400, statusMessage: 'payment_method_id obrigatório' })
  if (!identificationNumber) throw createError({ statusCode: 400, statusMessage: 'CPF obrigatório' })

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
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  const priceOverride = (produto as any).precosLoja?.[0] || null
  const effectivePrice = priceOverride?.preco ?? (produto as any).preco

  if (!storeSlug) {
    throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })
  }

  const round2 = (n: number) => Math.round(n * 100) / 100

  let order: any
  let coupon: { id: string; code: string; percent: number } | null = null

  try {
    const trx = await (prisma as any).$transaction(async (tx: any) => {
      const customer = await tx.customer.upsert({
        where: { email_storeSlug: { email, storeSlug } },
        create: { email, storeSlug },
        update: {}
      })

      let couponLocal: { id: string; code: string; percent: number } | null = null
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

        couponLocal = { id: c.id, code: c.code, percent }
      }

      const subtotalAmount = round2(Number(effectivePrice))
      const pixDiscountPercent = 0
      const pixDiscountAmount = 0
      const couponDiscountAmount = couponLocal ? round2(subtotalAmount * (couponLocal.percent / 100)) : 0
      const totalAmount = Math.max(0, round2(subtotalAmount - pixDiscountAmount - couponDiscountAmount))

      if (couponLocal) {
        await tx.cupom.update({
          where: { id: couponLocal.id },
          data: { usedCount: { increment: 1 } }
        })
      }

      const orderLocal = await tx.order.create({
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
          cupomId: couponLocal?.id || null,
          subtotalAmount,
          pixDiscountPercent,
          pixDiscountAmount,
          couponCode: couponLocal?.code || null,
          couponPercent: couponLocal?.percent || null,
          couponDiscountAmount: couponLocal ? couponDiscountAmount : null,
          totalAmount
        }
      })

      return { order: orderLocal, coupon: couponLocal }
    })

    order = trx.order
    coupon = trx.coupon
  } catch (err: any) {
    if (err?.statusCode && err?.statusMessage) {
      throw err
    }
    throw createError({ statusCode: 500, statusMessage: err?.message || 'Falha ao criar pedido' })
  }

  const payment = getMpPayment()

  const transactionAmount = Number(order.totalAmount ?? Number(effectivePrice))

  let result: any
  try {
    result = await payment.create({
      body: {
        transaction_amount: transactionAmount,
        description: produto.nome,
        token,
        installments,
        payment_method_id: paymentMethodId,
        issuer_id: Number.isFinite(issuerIdNumber as number) ? (issuerIdNumber as number) : undefined,
        payer: {
          email,
          identification: {
            type: identificationType,
            number: identificationNumber
          }
        },
        metadata: {
          orderId: order.id,
          produtoId: produto.id,
          couponCode: coupon?.code || null,
          couponPercent: coupon?.percent || null
        },
        external_reference: order.id
      }
    })
  } catch (err: any) {
    const formatted = formatMpError(err)
    throw createError({
      statusCode: 502,
      statusMessage: formatted.detail ? `Mercado Pago error: ${formatted.detail}${formatted.meta}` : 'Mercado Pago error'
    })
  }

  const mpPaymentId = String((result as any)?.id || '')
  if (!mpPaymentId) {
    throw createError({ statusCode: 502, statusMessage: 'Falha ao criar pagamento no Mercado Pago' })
  }

  const paymentTypeId = (result as any)?.payment_type_id
  const mpPaymentMethodId = (result as any)?.payment_method_id

  const status = String((result as any)?.status || '').toLowerCase()

  await (prisma as any).order.update({
    where: { id: order.id },
    data: {
      mercadoPagoPaymentId: mpPaymentId,
      mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
      mercadoPagoPaymentMethodId: mpPaymentMethodId ? String(mpPaymentMethodId) : null,
      status: status === 'approved' ? 'PAID' : 'PENDING',
      pagoEm: status === 'approved' ? new Date() : null
    }
  })

  if (status === 'approved') {
    processMercadoPagoPayment(mpPaymentId).catch((err) => {
      console.log('[card] processMercadoPagoPayment error', err)
    })
  }

  return {
    ok: true,
    orderId: order.id,
    paymentId: mpPaymentId,
    status
  }
})
