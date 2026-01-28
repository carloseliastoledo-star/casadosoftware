import { defineEventHandler, readBody, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const id = String(getRouterParam(event, 'id') || '').trim()
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
  }

  const body = await readBody(event)
  const licencaId = String(body?.licencaId || '').trim()
  if (!licencaId) {
    throw createError({ statusCode: 400, statusMessage: 'licencaId obrigatório' })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      produtoId: true,
      customerId: true,
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

  const result = await prisma.$transaction(async (tx) => {
    const licenca = await tx.licenca.findUnique({
      where: { id: licencaId },
      select: { id: true, chave: true, status: true, produtoId: true, orderId: true, customerId: true }
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
        customerId: order.customerId
      },
      select: { id: true, chave: true }
    })

    const html = renderLicenseEmail({
      produtoNome: produto.nome,
      licenseKey: updatedLicenca.chave,
      orderId: order.id
    })

    const bcc =
      String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

    await sendMail({
      to: customer.email,
      bcc,
      subject: `Sua licença: ${produto.nome}`,
      html
    })

    await tx.order.update({
      where: { id: order.id },
      data: {
        emailEnviadoEm: new Date(),
        fulfillmentStatus: 'SENT',
        fulfillmentError: null,
        fulfillmentUpdatedAt: new Date()
      },
      select: { id: true }
    })

    return {
      customerEmail: customer.email,
      produtoNome: produto.nome,
      licenca: updatedLicenca
    }
  })

  return {
    ok: true,
    orderId: id,
    customerEmail: result.customerEmail,
    produtoNome: result.produtoNome,
    licenca: result.licenca
  }
})
