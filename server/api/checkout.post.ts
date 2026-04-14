/**
 * POST /api/checkout — gateway híbrido: Pagar.me (BR) + Stripe (INT)
 * Suporta PIX, cartão, order bump e captura de afiliado
 */
import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getStoreContext } from '#root/server/utils/store'
import { detectCountry } from '#root/server/utils/detectCountry'
import { routePayment } from '#root/server/services/paymentRouter'

function round2(n: number) { return Math.round(n * 100) / 100 }

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { storeSlug } = getStoreContext(event)
  const country = detectCountry(event)

  const produtoId   = String(body?.produtoId   || '').trim()
  const email       = String(body?.email       || '').trim().toLowerCase()
  const nome        = String(body?.nome        || '').trim()
  const document    = String(body?.document    || body?.cpf || '').trim()
  const method      = String(body?.method      || 'pix') as 'pix' | 'credit_card' | 'stripe_card'
  const affiliate   = String(body?.affiliate   || body?.ref || '').trim()
  const currency    = String(body?.currency    || (country === 'BR' ? 'brl' : 'usd')).toLowerCase()
  const orderBump   = Boolean(body?.orderBump)
  const bumpProductId = body?.bumpProductId ? String(body.bumpProductId).trim() : null
  const installments  = Number(body?.installments) || 1
  const card          = body?.card ?? null

  const utmSource   = body?.utm_source   ? String(body.utm_source).trim()   : null
  const utmMedium   = body?.utm_medium   ? String(body.utm_medium).trim()   : null
  const utmCampaign = body?.utm_campaign ? String(body.utm_campaign).trim() : null
  const utmTerm     = body?.utm_term     ? String(body.utm_term).trim()     : null
  const utmContent  = body?.utm_content  ? String(body.utm_content).trim()  : null
  const gclid       = body?.gclid        ? String(body.gclid).trim()        : null
  const fbclid      = body?.fbclid       ? String(body.fbclid).trim()       : null
  const referrer    = body?.referrer     ? String(body.referrer).trim()     : null
  const landingPage = body?.landingPage  ? String(body.landingPage).trim()  : null

  function inferTrafficSourceType() {
    if (gclid || utmMedium === 'cpc' || utmMedium === 'ppc' || utmMedium === 'paid' || utmMedium === 'paidsearch') return 'cpc'
    if (utmMedium === 'organic') return 'organic'
    if (!referrer) return 'direct'
    if (/google\.|bing\.|yahoo\.|duckduckgo\.|yandex\./.test(referrer)) return 'organic'
    return 'referral'
  }
  const trafficSourceType = inferTrafficSourceType()

  if (!produtoId) throw createError({ statusCode: 400, statusMessage: 'produtoId obrigatório' })
  if (!email || !email.includes('@')) throw createError({ statusCode: 400, statusMessage: 'Email inválido' })
  if (!storeSlug) throw createError({ statusCode: 500, statusMessage: 'STORE_SLUG não configurado' })

  const produto = await (prisma as any).produto.findFirst({
    where: { id: produtoId, ativo: true },
    select: {
      id: true, nome: true, preco: true,
      precosLoja: { where: { storeSlug }, select: { preco: true } },
      precosMoeda: { where: { storeSlug }, select: { currency: true, amount: true } },
    },
  })
  if (!produto) throw createError({ statusCode: 404, statusMessage: 'Produto não encontrado' })

  // Preço correto por loja / moeda
  const lojaPreco = produto.precosLoja?.[0]?.preco
  const baseBrl = lojaPreco ?? produto.preco
  const moedaRow = produto.precosMoeda?.find((x: any) => x.currency === currency)
  const amountBrl = round2(baseBrl)
  const amountForeign = moedaRow ? round2(moedaRow.amount) : null

  // Order bump: adiciona segundo produto ao valor total
  let bumpAmount = 0
  let bumpProduto: any = null
  if (orderBump && bumpProductId) {
    bumpProduto = await (prisma as any).produto.findFirst({
      where: { id: bumpProductId, ativo: true },
      select: { id: true, nome: true, preco: true },
    })
    if (bumpProduto) {
      bumpAmount = round2(bumpProduto.preco)
    }
  }

  const totalBrl = round2(amountBrl + bumpAmount)
  const totalForeign = amountForeign ? round2(amountForeign + bumpAmount) : null

  // Afiliado
  let affiliateId: number | null = null
  let affiliateRecipientId: string | undefined
  let affiliatePercentage: number | undefined

  if (affiliate && String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
    const aff = await (prisma as any).affiliate.findUnique({
      where: { refCode: affiliate },
      select: { id: true, commissionRate: true },
    })
    if (aff) {
      affiliateId = aff.id
      affiliatePercentage = Math.round((aff.commissionRate || 0) * 100)
    }
  }

  // Cliente
  const customer = await (prisma as any).customer.upsert({
    where: { email_storeSlug: { email, storeSlug } },
    create: { email, storeSlug, nome: nome || null },
    update: { nome: nome || undefined },
  })

  // Deduplicação: reutiliza pedido PENDING recente do mesmo cliente/produto/valor
  const dedupeWindow = new Date(Date.now() - 60 * 60 * 1000) // última hora
  const existingOrder = await (prisma as any).order.findFirst({
    where: {
      customerId: customer.id,
      produtoId: produto.id,
      storeSlug,
      status: 'PENDING',
      currency: currency.toUpperCase(),
      orderBump,
      criadoEm: { gte: dedupeWindow },
    },
    orderBy: { criadoEm: 'desc' },
    select: { id: true },
  })

  // Cria pedido (ou reutiliza existente)
  const order = existingOrder ?? await (prisma as any).order.create({
    data: {
      status: 'PENDING',
      storeSlug,
      customerId: customer.id,
      produtoId: produto.id,
      affiliateId,
      currency: currency.toUpperCase(),
      countryCode: country,
      subtotalAmount: amountBrl,
      totalAmount: totalBrl,
      orderBump,
      bumpProductId: bumpProduto?.id ?? null,
      trafficSourceType,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      gclid,
      fbclid,
      referrer,
      landingPage,
    },
    select: { id: true },
  })

  // Ler gateways configurados no admin
  const validGateways = ['mercadopago', 'pagarme', 'pagbank'] as const
  let pixGateway: 'mercadopago' | 'pagarme' | 'pagbank' = 'mercadopago'
  let cardGateway: 'mercadopago' | 'pagarme' | 'pagbank' = 'mercadopago'
  try {
    const settings = await (prisma as any).siteSettings.findFirst({
      where: storeSlug ? { storeSlug } : undefined,
      select: { pixGateway: true, cardGateway: true }
    })
    if (validGateways.includes(settings?.pixGateway))  pixGateway  = settings.pixGateway
    if (validGateways.includes(settings?.cardGateway)) cardGateway = settings.cardGateway
  } catch {}

  // Roteamento de pagamento
  let result: Awaited<ReturnType<typeof routePayment>>
  try {
    result = await routePayment({
      orderId: order.id,
      amountBrl: totalBrl,
      amountUsd: totalForeign ?? undefined,
      currency: currency === 'brl' ? undefined : currency,
      country,
      method,
      product: produto.nome,
      pixGateway,
      cardGateway,
      customer: { name: nome || email, email, document, phone: body.telefone || body.phone || undefined },
      card: card ?? undefined,
      installments,
      affiliateRecipientId,
      affiliatePercentage,
    })
  } catch (e: any) {
    const msg = e?.data?.message || e?.data?.statusMessage || e?.message || 'Erro ao processar pagamento'
    throw createError({ statusCode: 502, statusMessage: msg })
  }

  // Salva ID do gateway no pedido
  if (result.gateway === 'pagarme') {
    await (prisma as any).order.update({
      where: { id: order.id },
      data: { pagarmeChargeId: result.chargeId },
      select: { id: true },
    })
  } else if (result.gateway === 'mercadopago') {
    await (prisma as any).order.update({
      where: { id: order.id },
      data: { mercadoPagoPaymentId: (result as any).paymentId ?? null },
      select: { id: true },
    })
  } else if (result.gateway === 'stripe') {
    await (prisma as any).order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: (result as any).clientSecret?.split('_secret_')[0] ?? null },
      select: { id: true },
    })
  }

  // Registra lead (checkout iniciado) — não bloqueia o fluxo em caso de falha
  try {
    await (prisma as any).lead.create({
      data: {
        email,
        produtoId: produto.id,
        storeSlug,
        status: 'checkout_started',
        bumpAdded: orderBump,
        totalAmount: totalBrl,
      },
      select: { id: true },
    })
  } catch {
    // ignora falha no lead
  }

  return { ok: true, orderId: order.id, ...result }
})
