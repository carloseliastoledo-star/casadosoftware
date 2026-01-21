import prisma from '../db/prisma'
import { getMpAccessToken, getMpPayment } from './mercadopago.js'
import { renderLicenseEmail, sendMail } from './mailer.js'

export async function processMercadoPagoPayment(dataId: string) {
  try {
    const payment = getMpPayment()
    const mpPayment = await payment.get({ id: dataId })

    const status = String((mpPayment as any)?.status || '')
    const orderId = (mpPayment as any)?.metadata?.orderId || (mpPayment as any)?.external_reference

    if (!orderId) {
      return { ok: true }
    }

    if (status === 'approved') {
      await prisma.$transaction(async (tx) => {
        let order:
          | { id: string; produtoId: string; customerId: string; emailEnviadoEm: Date | null }
          | null = null

        try {
          order = await tx.order.update({
            where: { id: String(orderId) },
            data: {
              status: 'PAID',
              pagoEm: new Date(),
              mercadoPagoPaymentId: String((mpPayment as any)?.id || dataId)
            },
            select: { id: true, produtoId: true, customerId: true, emailEnviadoEm: true }
          })
        } catch (err: any) {
          if (String(err?.code || '') === 'P2025') {
            console.log('[mp webhook] order not found for payment', { orderId: String(orderId), dataId })
            return
          }
          throw err
        }

        if (!order) return
        if (order.emailEnviadoEm) return

        const already = await tx.licenca.findFirst({
          where: { orderId: order.id },
          select: { id: true }
        })
        if (already) return

        const candidate = await tx.licenca.findFirst({
          where: {
            produtoId: order.produtoId,
            status: 'STOCK',
            orderId: null,
            customerId: null
          },
          select: { id: true }
        })

        if (!candidate) return

        const licenca = await tx.licenca.update({
          where: { id: candidate.id },
          data: {
            status: 'SOLD',
            orderId: order.id,
            customerId: order.customerId
          },
          select: { id: true, chave: true }
        })

        const [customer, produto] = await Promise.all([
          tx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
          tx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
        ])

        if (!customer?.email || !produto?.nome) return

        const html = renderLicenseEmail({
          produtoNome: produto.nome,
          licenseKey: licenca.chave,
          orderId: order.id
        })

        await sendMail({
          to: customer.email,
          subject: `Sua licença: ${produto.nome}`,
          html
        })

        await tx.order.update({
          where: { id: order.id },
          data: { emailEnviadoEm: new Date() }
        })
      })
    } else if (status === 'rejected' || status === 'cancelled') {
      try {
        await prisma.order.update({
          where: { id: String(orderId) },
          data: {
            status: status.toUpperCase(),
            mercadoPagoPaymentId: String((mpPayment as any)?.id || dataId)
          }
        })
      } catch (err: any) {
        if (String(err?.code || '') === 'P2025') {
          console.log('[mp webhook] order not found for rejected/cancelled payment', { orderId: String(orderId), dataId })
          return { ok: true }
        }
        throw err
      }
    }

    return { ok: true }
  } catch (err) {
    console.log('[mp webhook] processMercadoPagoPayment error', err)
    return { ok: true }
  }
}

export async function processMercadoPagoMerchantOrder(merchantOrderId: string) {
  try {
    const accessToken = getMpAccessToken()

    const resp = await fetch(`https://api.mercadopago.com/merchant_orders/${encodeURIComponent(merchantOrderId)}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!resp.ok) {
      console.log('[mp webhook] merchant_order fetch failed', { merchantOrderId, status: resp.status })
      return { ok: true }
    }

    const mo = (await resp.json()) as any
    const payments = Array.isArray(mo?.payments) ? mo.payments : []

    const candidate = payments.find((p: any) => String(p?.status || '').toLowerCase() === 'approved') || payments[0]
    const paymentId = String(candidate?.id || '')

    if (!paymentId) {
      console.log('[mp webhook] merchant_order no payment id', { merchantOrderId })
      return { ok: true }
    }

    return await processMercadoPagoPayment(paymentId)
  } catch (err) {
    console.log('[mp webhook] processMercadoPagoMerchantOrder error', err)
    return { ok: true }
  }
}
