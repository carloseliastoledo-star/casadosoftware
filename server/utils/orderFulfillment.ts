import prisma from '#root/server/db/prisma'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'

export async function fulfillPaidOrder(orderId: string) {
  if (!orderId) {
    throw new Error('orderId obrigatório')
  }

  await (prisma as any).$transaction(async (tx: any) => {
    const order = await tx.order.findUnique({
      where: { id: String(orderId) },
      select: {
        id: true,
        status: true,
        produtoId: true,
        customerId: true,
        storeSlug: true,
        emailEnviadoEm: true
      }
    })

    if (!order) {
      throw new Error('Pedido não encontrado')
    }

    if (String(order.status || '').toUpperCase() !== 'PAID') {
      throw new Error('Pedido não está pago')
    }

    await tx.order.update({
      where: { id: order.id },
      data: {
        fulfillmentStatus: 'PENDING',
        fulfillmentError: null,
        fulfillmentUpdatedAt: new Date()
      },
      select: { id: true }
    })

    if (order.emailEnviadoEm) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: 'SENT',
          fulfillmentError: null,
          fulfillmentUpdatedAt: new Date()
        },
        select: { id: true }
      })
      return
    }

    const already = await tx.licenca.findFirst({
      where: { orderId: order.id },
      select: { id: true }
    })

    if (already) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: 'PENDING',
          fulfillmentError: 'Licença já vinculada ao pedido, mas e-mail ainda não foi enviado.',
          fulfillmentUpdatedAt: new Date()
        },
        select: { id: true }
      })
      return
    }

    const candidate = await tx.licenca.findFirst({
      where: {
        produtoId: order.produtoId,
        status: 'STOCK',
        orderId: null,
        customerId: null,
        storeSlug: order.storeSlug
      },
      select: { id: true }
    })

    if (!candidate) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: 'NO_STOCK',
          fulfillmentError: 'Sem licença em estoque para este produto.',
          fulfillmentUpdatedAt: new Date()
        },
        select: { id: true }
      })
      return
    }

    const licenca = await tx.licenca.update({
      where: { id: candidate.id },
      data: {
        status: 'SOLD',
        orderId: order.id,
        customerId: order.customerId,
        storeSlug: order.storeSlug
      },
      select: { id: true, chave: true }
    })

    const [customer, produto] = await Promise.all([
      tx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
      tx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
    ])

    if (!customer?.email || !produto?.nome) {
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: 'PENDING',
          fulfillmentError: 'Dados insuficientes para envio (cliente/produto).',
          fulfillmentUpdatedAt: new Date()
        },
        select: { id: true }
      })
      return
    }

    const html = renderLicenseEmail({
      produtoNome: produto.nome,
      licenseKey: licenca.chave,
      orderId: order.id
    })

    const now = new Date()
    try {
      const bcc = String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'
      await sendMail({
        to: customer.email,
        bcc,
        subject: `Sua licença: ${produto.nome}`,
        html
      })

      await tx.order.update({
        where: { id: order.id },
        data: {
          emailEnviadoEm: now,
          fulfillmentStatus: 'SENT',
          fulfillmentError: null,
          fulfillmentUpdatedAt: now
        },
        select: { id: true }
      })
    } catch (err: any) {
      const msg = String(err?.data?.statusMessage || err?.message || 'Falha ao enviar e-mail')
      await tx.order.update({
        where: { id: order.id },
        data: {
          fulfillmentStatus: 'SMTP_ERROR',
          fulfillmentError: msg,
          fulfillmentUpdatedAt: now
        },
        select: { id: true }
      })
      return
    }
  })
}
