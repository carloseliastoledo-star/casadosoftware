import { defineEventHandler } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'
import { getStoreContext } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const { storeSlug } = getStoreContext(event)

  // Buscar pedidos PAID sem email enviado
  const pendingOrders = await (prisma as any).order.findMany({
    where: {
      status: 'PAID',
      emailEnviadoEm: null,
      ...(storeSlug ? { storeSlug } : {})
    },
    select: {
      id: true,
      produtoId: true,
      customerId: true,
      storeSlug: true,
      fulfillmentStatus: true,
      fulfillmentError: true,
      licencas: { select: { id: true, chave: true } },
      customer: { select: { email: true } },
      produto: { select: { nome: true } }
    },
    orderBy: { criadoEm: 'desc' },
    take: 50
  })

  const results: any[] = []

  for (const order of pendingOrders) {
    const entry: any = {
      orderId: order.id,
      customerEmail: order.customer?.email,
      produtoNome: order.produto?.nome,
      previousStatus: order.fulfillmentStatus,
      previousError: order.fulfillmentError
    }

    try {
      // Se já tem licença vinculada, só enviar email
      if (order.licencas.length > 0) {
        const licenca = order.licencas[0]

        if (!order.customer?.email || !order.produto?.nome) {
          entry.result = 'SKIP'
          entry.reason = 'Dados insuficientes (cliente/produto)'
          results.push(entry)
          continue
        }

        const html = renderLicenseEmail({
          produtoNome: order.produto.nome,
          licenseKey: licenca.chave,
          orderId: order.id
        })

        const bcc = String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

        await sendMail({
          to: order.customer.email,
          bcc,
          subject: `Sua licença: ${order.produto.nome}`,
          html
        })

        await (prisma as any).order.update({
          where: { id: order.id },
          data: {
            emailEnviadoEm: new Date(),
            fulfillmentStatus: 'SENT',
            fulfillmentError: null,
            fulfillmentUpdatedAt: new Date()
          }
        })

        entry.result = 'SENT'
        entry.reason = 'Licença já vinculada, email enviado'
        results.push(entry)
        continue
      }

      // Buscar licença disponível
      let candidate = await (prisma as any).licenca.findFirst({
        where: {
          produtoId: order.produtoId,
          status: 'STOCK',
          orderId: null,
          customerId: null,
          storeSlug: order.storeSlug
        },
        select: { id: true }
      })

      // Fallback: licença legada
      if (!candidate && order.storeSlug) {
        candidate = await (prisma as any).licenca.findFirst({
          where: {
            produtoId: order.produtoId,
            status: 'STOCK',
            orderId: null,
            customerId: null,
            storeSlug: null
          },
          select: { id: true }
        })
      }

      if (!candidate) {
        await (prisma as any).order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: 'NO_STOCK',
            fulfillmentError: 'Sem licença em estoque (retry)',
            fulfillmentUpdatedAt: new Date()
          }
        })
        entry.result = 'NO_STOCK'
        entry.reason = 'Sem licença em estoque'
        results.push(entry)
        continue
      }

      // Vincular licença
      const licenca = await (prisma as any).licenca.update({
        where: { id: candidate.id },
        data: {
          status: 'SOLD',
          orderId: order.id,
          customerId: order.customerId,
          storeSlug: order.storeSlug
        },
        select: { id: true, chave: true }
      })

      if (!order.customer?.email || !order.produto?.nome) {
        entry.result = 'LINKED_NO_EMAIL'
        entry.reason = 'Licença vinculada mas dados insuficientes para email'
        results.push(entry)
        continue
      }

      // Enviar email
      const html = renderLicenseEmail({
        produtoNome: order.produto.nome,
        licenseKey: licenca.chave,
        orderId: order.id
      })

      const bcc = String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

      await sendMail({
        to: order.customer.email,
        bcc,
        subject: `Sua licença: ${order.produto.nome}`,
        html
      })

      await (prisma as any).order.update({
        where: { id: order.id },
        data: {
          emailEnviadoEm: new Date(),
          fulfillmentStatus: 'SENT',
          fulfillmentError: null,
          fulfillmentUpdatedAt: new Date()
        }
      })

      entry.result = 'SENT'
      entry.reason = 'Licença vinculada e email enviado'
      results.push(entry)
    } catch (err: any) {
      const msg = String(err?.message || err || 'Erro desconhecido')
      console.error(`[retry-fulfillment] Erro no pedido ${order.id}:`, msg)

      try {
        await (prisma as any).order.update({
          where: { id: order.id },
          data: {
            fulfillmentStatus: 'SMTP_ERROR',
            fulfillmentError: msg,
            fulfillmentUpdatedAt: new Date()
          }
        })
      } catch {}

      entry.result = 'ERROR'
      entry.reason = msg
      results.push(entry)
    }
  }

  const summary = {
    total: pendingOrders.length,
    sent: results.filter(r => r.result === 'SENT').length,
    noStock: results.filter(r => r.result === 'NO_STOCK').length,
    errors: results.filter(r => r.result === 'ERROR').length,
    skipped: results.filter(r => r.result === 'SKIP' || r.result === 'LINKED_NO_EMAIL').length
  }

  return { ok: true, summary, results }
})
