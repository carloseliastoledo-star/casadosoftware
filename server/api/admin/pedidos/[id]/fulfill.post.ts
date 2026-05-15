import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  console.log('[admin/fulfill] ===== START =====')
  
  try {
    await requireAdminSession(event)

    const ctx = getStoreContext(event)

    const id = String(getRouterParam(event, 'id') || '').trim()
    console.log('[admin/fulfill] orderId:', id)
    
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
    }

    const body = await readBody(event)
    console.log('[admin/fulfill] body keys:', Object.keys(body || {}))
    
    const licencaId = String(body?.licencaId || '').trim()
    console.log('[admin/fulfill] licencaId:', licencaId)
    
    if (!licencaId) {
      throw createError({ statusCode: 400, statusMessage: 'licencaId obrigatório' })
    }

  console.log('[admin/fulfill] Buscando pedido...')
  
  const order = await (prisma as any).order.findFirst({
    where: whereForStore({ id }, ctx) as any,
    select: {
      id: true,
      status: true,
      produtoId: true,
      customerId: true,
      storeSlug: true,
      emailEnviadoEm: true,
      licencas: { select: { id: true } }
    }
  })

  console.log('[admin/fulfill] Pedido encontrado:', order ? 'SIM' : 'NÃO')
  
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }
  
  console.log('[admin/fulfill] Order status:', order?.status)

  const orderStatus = String(order.status || '').toUpperCase()
  if (orderStatus !== 'PAID') {
    throw createError({ statusCode: 400, statusMessage: `Pedido com status ${orderStatus}. Precisa estar PAID para entregar licença.` })
  }

  if (order.licencas.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Pedido já possui licença vinculada' })
  }

  // 1. Transaction: link license to order (no email inside tx)
  console.log('[admin/fulfill] Iniciando transação...')
  
  const result = await (prisma as any).$transaction(async (tx: any) => {
    const licenca = await tx.licenca.findUnique({
      where: { id: licencaId },
      select: { id: true, chave: true, status: true, produtoId: true, orderId: true, customerId: true, storeSlug: true }
    })

    if (!licenca) {
      throw createError({ statusCode: 404, statusMessage: 'Licença não encontrada' })
    }

    if (licenca.produtoId !== order.produtoId) {
      throw createError({ statusCode: 400, statusMessage: 'Licença não pertence ao mesmo produto do pedido' })
    }

    if (licenca.status !== 'STOCK' || licenca.orderId || licenca.customerId) {
      throw createError({ statusCode: 400, statusMessage: 'Licença não está disponível em estoque' })
    }

    // Permitir licenças legadas (storeSlug null) para qualquer loja
    if (licenca.storeSlug && order.storeSlug && String(licenca.storeSlug) !== String(order.storeSlug)) {
      throw createError({ statusCode: 400, statusMessage: 'Licença não pertence à mesma loja do pedido' })
    }

    const [customer, produto] = await Promise.all([
      tx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
      tx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
    ])

    if (!customer?.email) {
      throw createError({ statusCode: 400, statusMessage: 'E-mail do cliente não encontrado' })
    }

    if (!produto?.nome) {
      throw createError({ statusCode: 400, statusMessage: 'Produto do pedido não encontrado' })
    }

    const updatedLicenca = await tx.licenca.update({
      where: { id: licenca.id },
      data: {
        status: 'SOLD',
        orderId: order.id,
        customerId: order.customerId,
        storeSlug: order.storeSlug
      },
      select: { id: true, chave: true }
    })

    return {
      customerEmail: customer.email,
      produtoNome: produto.nome,
      licenca: updatedLicenca
    }
  })

  // 2. Send email OUTSIDE the transaction (so SMTP failure doesn't roll back license)
  let emailSent = false
  let emailError = ''
  try {
    const html = renderLicenseEmail({
      produtoNome: result.produtoNome,
      licenseKey: result.licenca.chave,
      orderId: order.id
    })

    const bcc =
      String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

    await sendMail({
      to: result.customerEmail,
      bcc,
      subject: `Sua licença: ${result.produtoNome}`,
      html
    })
    emailSent = true
  } catch (err: any) {
    emailError = String(err?.message || err || 'Erro ao enviar email')
    console.error('[fulfill] SMTP error:', emailError)
  }

  // 3. Update order fulfillment status
  console.log('[admin/fulfill] Atualizando status do pedido...')
  
  try {
    await (prisma as any).order.update({
      where: { id: order.id },
      data: {
        emailEnviadoEm: emailSent ? new Date() : undefined,
        fulfillmentStatus: emailSent ? 'SENT' : 'SMTP_ERROR',
        fulfillmentError: emailSent ? null : emailError,
        fulfillmentUpdatedAt: new Date()
      },
      select: { id: true }
    })
    console.log('[admin/fulfill] Status atualizado com sucesso')
  } catch (updateErr: any) {
    console.error('[admin/fulfill] Erro ao atualizar order:', updateErr)
    console.error('[admin/fulfill] message:', updateErr?.message)
    console.error('[admin/fulfill] code:', updateErr?.code)
    // Não falhar se o update der erro, a licença já foi vinculada
  }

  console.log('[admin/fulfill] ===== END =====')

  return {
    ok: true,
    orderId: id,
    customerEmail: result.customerEmail,
    produtoNome: result.produtoNome,
    licenca: result.licenca,
    emailSent,
    emailError: emailSent ? undefined : emailError
  }
  
  } catch (err: any) {
    console.error('[admin/fulfill] ===== ERROR =====')
    console.error('[admin/fulfill] error:', err)
    console.error('[admin/fulfill] message:', err?.message)
    console.error('[admin/fulfill] code:', err?.code)
    console.error('[admin/fulfill] meta:', err?.meta)
    
    throw createError({ 
      statusCode: err?.statusCode || 503, 
      statusMessage: err?.statusMessage || `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
