import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const ctx = getStoreContext()

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)
  const licencaId = String(body?.licencaId || '').trim()
  if (!licencaId) {
    throw createError({ statusCode: 400, statusMessage: 'licencaId obrigatório' })
  }

  const order = await prisma.order.findFirst({
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

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
  }

  if (String(order.status || '').toUpperCase() !== 'PAID') {
    throw createError({ statusCode: 400, statusMessage: 'Pedido precisa estar com status PAID' })
  }

  if (order.licencas.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Pedido já possui licença vinculada' })
  }

  // 1. Transaction: link license to order (no email inside tx)
  const result = await prisma.$transaction(async (tx) => {
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
  await prisma.order.update({
    where: { id: order.id },
    data: {
      emailEnviadoEm: emailSent ? new Date() : undefined,
      fulfillmentStatus: emailSent ? 'SENT' : 'SMTP_ERROR',
      fulfillmentError: emailSent ? null : emailError,
      fulfillmentUpdatedAt: new Date()
    },
    select: { id: true }
  })

  return {
    ok: true,
    orderId: id,
    customerEmail: result.customerEmail,
    produtoNome: result.produtoNome,
    licenca: result.licenca,
    emailSent,
    emailError: emailSent ? undefined : emailError
  }
})
