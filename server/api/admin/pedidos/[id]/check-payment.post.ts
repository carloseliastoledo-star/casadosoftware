import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { getMpAccessToken } from '#root/server/utils/mercadopago'
import { processMercadoPagoPayment } from '#root/server/utils/mercadopagoWebhook'
import { requireAdminSession } from '#root/server/utils/adminSession'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID do pedido obrigatório' })

  const order = await (prisma as any).order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      mercadoPagoPaymentId: true
    }
  })

  if (!order) throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })

  if (order.status === 'PAID') {
    return { ok: true, message: 'Pedido já está marcado como PAID.' }
  }

  // 1. Tenta pelo mercadoPagoPaymentId já salvo
  if (order.mercadoPagoPaymentId) {
    await processMercadoPagoPayment(String(order.mercadoPagoPaymentId))
    const updated = await (prisma as any).order.findUnique({
      where: { id },
      select: { status: true }
    })
    return { ok: true, message: `Verificação concluída. Status atual: ${updated?.status}` }
  }

  // 2. Busca no MP por external_reference = orderId
  try {
    const accessToken = getMpAccessToken()
    const resp = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(id)}&sort=date_created&criteria=desc&limit=5`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!resp.ok) {
      throw createError({ statusCode: 502, statusMessage: `MP API retornou ${resp.status}` })
    }

    const data = (await resp.json()) as any
    const results: any[] = Array.isArray(data?.results) ? data.results : []

    const approved = results.find((p: any) => String(p?.status || '') === 'approved')
    const candidate = approved || results[0]

    if (!candidate?.id) {
      return { ok: false, message: 'Nenhum pagamento encontrado no MercadoPago para este pedido.' }
    }

    await processMercadoPagoPayment(String(candidate.id))
    const updated = await (prisma as any).order.findUnique({
      where: { id },
      select: { status: true }
    })
    return { ok: true, message: `Verificação concluída. Status atual: ${updated?.status}` }
  } catch (err: any) {
    if (err?.statusCode) throw err
    throw createError({ statusCode: 500, statusMessage: String(err?.message || 'Erro ao consultar MercadoPago') })
  }
})
