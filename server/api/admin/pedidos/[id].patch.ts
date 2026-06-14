import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'
import { getStoreContext, whereForStore } from '../../../utils/store'
import { markOrderAsPaid } from '../../../services/markOrderAsPaid.js'

type AllowedStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'CANCELLED'

export default defineEventHandler(async (event) => {
  try {
    requireAdminSession(event)

  const ctx = getStoreContext(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)

  const order = await (prisma as any).order.findFirst({
    where: whereForStore({ id, deletedAt: null }, ctx) as any,
    select: { id: true, status: true, storeSlug: true, Licenca: { select: { id: true } } }
  })

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  const data: any = {}

  // Status
  if (body?.status !== undefined) {
    const statusRaw = String(body.status || '').trim().toUpperCase()
    const allowed: AllowedStatus[] = ['PENDING', 'PAID', 'REJECTED', 'CANCELLED']
    if (!allowed.includes(statusRaw as AllowedStatus)) {
      throw createError({ statusCode: 400, statusMessage: 'status inválido' })
    }
    if (order.Licenca.length > 0 && statusRaw !== 'PAID') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Não é possível alterar status para diferente de PAID quando já existe licença vinculada ao pedido'
      })
    }
    
    // Se alterando para PAID, usar markOrderAsPaid
    if (statusRaw === 'PAID' && order.status !== 'PAID') {
      console.log('[admin patch] Status changing to PAID, calling markOrderAsPaid')
      await markOrderAsPaid({
        orderId: id,
        source: 'manual_admin'
      })
      return { ok: true, message: 'Pedido marcado como pago com sucesso' }
    }
    
    data.status = statusRaw
    if (statusRaw === 'PAID' && !data.pagoEm) {
      data.pagoEm = new Date()
    } else if (statusRaw !== 'PAID') {
      data.pagoEm = null
    }
  }

  // Data de pagamento manual (só se não estiver mudando para PAID, pois markOrderAsPaid já trata isso)
  if (body?.pagoEm !== undefined && body?.status !== 'PAID') {
    if (body.pagoEm === null || body.pagoEm === '') {
      data.pagoEm = null
    } else {
      const d = new Date(String(body.pagoEm))
      if (!isNaN(d.getTime())) data.pagoEm = d
    }
  }

  // Valor total
  if (body?.totalAmount !== undefined) {
    const v = parseFloat(String(body.totalAmount ?? ''))
    if (!isNaN(v) && v >= 0) data.totalAmount = v
  }

  // Produto
  if (body?.produtoId !== undefined) {
    const pid = String(body.produtoId || '').trim()
    if (pid) {
      const prod = await (prisma as any).produto.findFirst({ where: { id: pid }, select: { id: true } })
      if (!prod) throw createError({ statusCode: 400, statusMessage: 'Produto não encontrado' })
      data.produtoId = pid
    }
  }

  // Email do cliente (atualiza o Customer)
  if (body?.customerEmail !== undefined) {
    const email = String(body.customerEmail || '').trim().toLowerCase()
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && emailRe.test(email)) {
      const currentOrder = await (prisma as any).order.findFirst({
        where: { id },
        select: { customerId: true }
      })
      if (currentOrder?.customerId) {
        const existingCustomer = await (prisma as any).customer.findFirst({
          where: { email, storeSlug: order.storeSlug },
          select: { id: true }
        })
        if (existingCustomer && existingCustomer.id !== currentOrder.customerId) {
          data.customerId = existingCustomer.id
        } else if (!existingCustomer) {
          await (prisma as any).customer.update({
            where: { id: currentOrder.customerId },
            data: { email }
          })
        }
      }
    }
  }

  if (Object.keys(data).length === 0) {
    return { ok: true, message: 'Nenhuma alteração' }
  }

  const updated = await (prisma as any).order.update({
    where: { id },
    data,
    select: { id: true, status: true, pagoEm: true, totalAmount: true }
  })

  return { ok: true, order: updated }
  } catch (err: any) {
    console.error('[admin patch] Error:', err)
    const message = err?.data?.statusMessage || err?.message || err?.statusMessage || 'Erro ao atualizar pedido'
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: message })
  }
})
