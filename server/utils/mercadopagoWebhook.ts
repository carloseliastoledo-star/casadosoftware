import prisma from '../db/prisma'
import { getMpAccessToken, getMpPayment } from './mercadopago.js'
import { renderLicenseEmail, sendMail } from './mailer.js'
import { sendTelegramMessage } from './telegram.js'
import { sendGa4PurchaseForOrder } from './ga4.js'
import { ensureMarketplaceCommissionForOrder } from './marketplaceCommission'

export async function processMercadoPagoPayment(dataId: string) {
  try {
    const payment = getMpPayment()
    const mpPayment = await payment.get({ id: dataId })

    const status = String((mpPayment as any)?.status || '')
    const paymentTypeId = (mpPayment as any)?.payment_type_id
    const paymentMethodId = (mpPayment as any)?.payment_method_id
    const orderId = (mpPayment as any)?.metadata?.orderId || (mpPayment as any)?.external_reference

    if (!orderId) {
      return { ok: true }
    }

    if (status === 'approved') {
      type TelegramReservation = { orderId: string; reservedAt: Date }
      type TelegramPayload = { orderId: string; produtoNome: string; customerEmail: string }

      let telegramReservation: TelegramReservation | null = null
      let telegramPayload: TelegramPayload | null = null

      const paidAt = new Date()
      const availableAt = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000)

      await prisma.$transaction(async (tx) => {
        const anyTx: any = tx as any
        let order:
          | {
              id: string
              produtoId: string
              customerId: string
              storeSlug: string | null
              affiliateId: number | null
              totalAmount: number | null
              emailEnviadoEm: Date | null
              telegramEnviadoEm: Date | null
            }
          | null = null

        try {
          order = await anyTx.order.update({
            where: { id: String(orderId) },
            data: {
              status: 'PAID',
              pagoEm: paidAt,
              mercadoPagoPaymentId: String((mpPayment as any)?.id || dataId),
              mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
              mercadoPagoPaymentMethodId: paymentMethodId ? String(paymentMethodId) : null,
              fulfillmentStatus: 'PENDING',
              fulfillmentError: null,
              fulfillmentUpdatedAt: new Date()
            },
            select: {
              id: true,
              produtoId: true,
              customerId: true,
              storeSlug: true,
              affiliateId: true,
              totalAmount: true,
              emailEnviadoEm: true,
              telegramEnviadoEm: true
            }
          })
        } catch (err: any) {
          if (String(err?.code || '') === 'P2025') {
            console.log('[mp webhook] order not found for payment', { orderId: String(orderId), dataId })
            return
          }
          throw err
        }

        if (!order) return

        if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
          try {
            const affiliateId = Number((order as any)?.affiliateId ?? 0)
            if (affiliateId) {
              const existing = await anyTx.affiliateCommission.findFirst({
                where: { orderId: order.id, affiliateId },
                select: { id: true }
              })

              if (!existing) {
                const affiliate = await anyTx.affiliate.findUnique({
                  where: { id: affiliateId },
                  select: { commissionRate: true }
                })

                const totalAmount = Number((order as any)?.totalAmount ?? 0)
                const commissionRate = Number((affiliate as any)?.commissionRate ?? 0)
                const amount = Math.round(totalAmount * commissionRate * 100) / 100

                if (amount > 0) {
                  await anyTx.affiliateCommission.create({
                    data: {
                      orderId: order.id,
                      affiliateId,
                      amount,
                      availableAt
                    },
                    select: { id: true }
                  })
                }
              }
            }
          } catch {
            // ignore
          }
        }

        if (!order.telegramEnviadoEm) {
          const reservedAt = new Date()
          await anyTx.order.update({
            where: { id: order.id },
            data: { telegramEnviadoEm: reservedAt },
            select: { id: true }
          })

          const [customer, produto] = await Promise.all([
            anyTx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
            anyTx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
          ])

          if (customer?.email && produto?.nome) {
            telegramReservation = { orderId: order.id, reservedAt }
            telegramPayload = { orderId: order.id, produtoNome: produto.nome, customerEmail: customer.email }
          }
        }

        if (order.emailEnviadoEm) {
          await anyTx.order.update({
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

        const already = await anyTx.licenca.findFirst({
          where: { orderId: order.id },
          select: { id: true }
        })
        if (already) {
          await anyTx.order.update({
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

        const candidate = await anyTx.licenca.findFirst({
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
          await anyTx.order.update({
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

        const licenca = await anyTx.licenca.update({
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
          anyTx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
          anyTx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
        ])

        if (!customer?.email || !produto?.nome) {
          await anyTx.order.update({
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
          const bcc =
            String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'
          await sendMail({
            to: customer.email,
            bcc,
            subject: `Sua licença: ${produto.nome}`,
            html
          })

          await anyTx.order.update({
            where: { id: order.id },
            data: {
              emailEnviadoEm: now,
              fulfillmentStatus: 'SENT',
              fulfillmentError: null,
              fulfillmentUpdatedAt: now
            }
          })
        } catch (err: any) {
          const msg = String(err?.data?.statusMessage || err?.message || 'Falha ao enviar e-mail')
          await anyTx.order.update({
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

      if (telegramReservation && telegramPayload) {
        const payload: TelegramPayload = telegramPayload
        const reservation: TelegramReservation = telegramReservation
        try {
          await sendTelegramMessage(
            `✅ Venda concluída\n` +
              `Pedido: ${payload.orderId}\n` +
              `Produto: ${payload.produtoNome}\n` +
              `Cliente: ${payload.customerEmail}`
          )
        } catch (err) {
          console.log('[mp webhook] telegram send error', err)
          try {
            await prisma.order.updateMany({
              where: { id: reservation.orderId, telegramEnviadoEm: reservation.reservedAt },
              data: { telegramEnviadoEm: null }
            })
          } catch (revertErr) {
            console.log('[mp webhook] telegram revert error', revertErr)
          }
        }
      }

      try {
        await sendGa4PurchaseForOrder(String(orderId), 'mercadopago')
      } catch {
        // ignore
      }

      try {
        await ensureMarketplaceCommissionForOrder(String(orderId))
      } catch {
        // ignore
      }
    } else if (status === 'rejected' || status === 'cancelled') {
      try {
        await (prisma as any).order.update({
          where: { id: String(orderId) },
          data: {
            status: status.toUpperCase(),
            mercadoPagoPaymentId: String((mpPayment as any)?.id || dataId),
            mercadoPagoPaymentTypeId: paymentTypeId ? String(paymentTypeId) : null,
            mercadoPagoPaymentMethodId: paymentMethodId ? String(paymentMethodId) : null
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
