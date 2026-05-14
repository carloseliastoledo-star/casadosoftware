import prisma from '../db/prisma'
import { renderLicenseEmail, sendMail } from '../utils/mailer.js'
import { sendTelegramMessage } from '../utils/telegram.js'
import { sendGa4PurchaseForOrder } from '../utils/ga4.js'
import { ensureMarketplaceCommissionForOrder } from '../utils/marketplaceCommission'

export type MarkOrderAsPaidSource = 'webhook' | 'manual_admin' | 'reconciliation'

export interface MarkOrderAsPaidOptions {
  orderId: string
  gateway?: string
  paymentId?: string
  amountPaid?: number
  source: MarkOrderAsPaidSource
  paymentMethodId?: string
  paymentTypeId?: string
}

export async function markOrderAsPaid(options: MarkOrderAsPaidOptions) {
  const { orderId, gateway, paymentId, amountPaid, source, paymentMethodId, paymentTypeId } = options

  console.log('[markOrderAsPaid] START', { orderId, gateway, paymentId, amountPaid, source })

  const paidAt = new Date()
  const availableAt = new Date(paidAt.getTime() + 7 * 24 * 60 * 60 * 1000)

  type TelegramReservation = { orderId: string; reservedAt: Date }
  type TelegramPayload = { orderId: string; produtoNome: string; customerEmail: string }
  type EmailPayload = { orderId: string; customerEmail: string; produtoNome: string; licenseKey: string }

  let telegramReservation: TelegramReservation | null = null
  let telegramPayload: TelegramPayload | null = null
  let emailPayload: EmailPayload | null = null
  let shouldContinue = false

  // ── TRANSACTION: apenas operações de banco (rápido) ──
  await prisma.$transaction(async (tx) => {
    const anyTx: any = tx as any

    // Verificar se o pedido já existe e qual é o status atual
    const orderBefore = await anyTx.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, pagoEm: true, fulfillmentStatus: true, mercadoPagoPaymentId: true }
    })

    if (!orderBefore) {
      console.log('[markOrderAsPaid] ERROR: Order not found', { orderId })
      throw new Error(`Order not found: ${orderId}`)
    }

    console.log('[markOrderAsPaid] Order before update:', {
      id: orderBefore.id,
      status: orderBefore.status,
      pagoEm: orderBefore.pagoEm,
      fulfillmentStatus: orderBefore.fulfillmentStatus
    })

    // Se já está PAID e tem pagoEm, evitar duplicidade
    if (orderBefore.status === 'PAID' && orderBefore.pagoEm) {
      console.log('[markOrderAsPaid] Order already PAID, skipping', { orderId })
      shouldContinue = false
      return
    }

    shouldContinue = true

    // Preparar dados de atualização
    const updateData: any = {
      status: 'PAID',
      pagoEm: paidAt,
      fulfillmentStatus: 'PENDING',
      fulfillmentError: null,
      fulfillmentUpdatedAt: new Date()
    }

    // Atualizar campos específicos do gateway se fornecidos
    if (gateway === 'mercadopago' && paymentId) {
      updateData.mercadoPagoPaymentId = paymentId
      if (paymentMethodId) updateData.mercadoPagoPaymentMethodId = paymentMethodId
      if (paymentTypeId) updateData.mercadoPagoPaymentTypeId = paymentTypeId
    }
    if (gateway === 'stripe' && paymentId) {
      updateData.stripePaymentIntentId = paymentId
    }
    if (gateway === 'pagarme' && paymentId) {
      updateData.pagarmeChargeId = paymentId
    }
    if (gateway === 'pagbank' && paymentId) {
      updateData.pagbankChargeId = paymentId
    }

    // Atualizar pedido
    const order = await anyTx.order.update({
      where: { id: orderId },
      data: updateData,
      select: {
        id: true,
        produtoId: true,
        customerId: true,
        storeSlug: true,
        affiliateId: true,
        totalAmount: true,
        emailEnviadoEm: true,
        telegramEnviadoEm: true,
        status: true,
        pagoEm: true
      }
    })

    console.log('[markOrderAsPaid] Order updated to PAID:', order.id)

    // Criar comissão de afiliado
    if (String(process.env.AFFILIATE_ENABLED || '').trim().toLowerCase() === 'true') {
      try {
        const affiliateId = Number(order.affiliateId ?? 0)
        console.log('[markOrderAsPaid] Checking affiliate commission, affiliateId:', affiliateId)
        if (affiliateId) {
          const existing = await anyTx.affiliateCommission.findFirst({
            where: { orderId: order.id, affiliateId },
            select: { id: true }
          })

          if (!existing) {
            console.log('[markOrderAsPaid] Creating new commission', { orderId, affiliateId })
            const affiliate = await anyTx.affiliate.findUnique({
              where: { id: affiliateId },
              select: { commissionRate: true }
            })

            const totalAmount = Number(order.totalAmount ?? 0)
            const commissionRate = Number(affiliate?.commissionRate ?? 0)
            const amount = Math.round(totalAmount * commissionRate * 100) / 100

            console.log('[markOrderAsPaid] Commission details:', { totalAmount, commissionRate, amount, availableAt })

            if (amount > 0) {
              try {
                const commission = await anyTx.affiliateCommission.create({
                  data: {
                    orderId: order.id,
                    affiliateId,
                    amount,
                    availableAt
                  },
                  select: { id: true }
                })
                console.log('[markOrderAsPaid] Commission created:', commission.id)
              } catch (createErr: any) {
                const isUniqueConstraintError =
                  createErr?.code === 'P2002' ||
                  createErr?.message?.includes('Unique constraint') ||
                  createErr?.message?.includes('Duplicate entry')

                if (isUniqueConstraintError) {
                  console.log('[markOrderAsPaid] Affiliate commission already exists, skipping', { orderId, affiliateId })
                } else {
                  throw createErr
                }
              }
            } else {
              console.log('[markOrderAsPaid] Commission amount is 0, skipping')
            }
          } else {
            console.log('[markOrderAsPaid] Commission already exists, skipping', { orderId, affiliateId, commissionId: existing.id })
          }
        } else {
          console.log('[markOrderAsPaid] Order has no affiliateId')
        }
      } catch (err: any) {
        console.error('[markOrderAsPaid] Error creating affiliate commission:', err)
      }
    } else {
      console.log('[markOrderAsPaid] AFFILIATE_ENABLED is false, skipping commission creation')
    }

    // Telegram notification
    if (!order.telegramEnviadoEm) {
      const reservedAt = new Date()
      await anyTx.order.update({
        where: { id: order.id },
        data: { telegramEnviadoEm: reservedAt },
        select: { id: true }
      })

      const [cust, prod] = await Promise.all([
        anyTx.customer.findUnique({ where: { id: order.customerId }, select: { email: true } }),
        anyTx.produto.findUnique({ where: { id: order.produtoId }, select: { nome: true } })
      ])

      if (cust?.email && prod?.nome) {
        telegramReservation = { orderId: order.id, reservedAt }
        telegramPayload = { orderId: order.id, produtoNome: prod.nome, customerEmail: cust.email }
      }
    }

    // Email já enviado?
    if (order.emailEnviadoEm) {
      console.log('[markOrderAsPaid] Email already sent, skipping', { orderId, sentAt: order.emailEnviadoEm })
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

    // Licença já vinculada?
    const already = await anyTx.licenca.findFirst({
      where: { orderId: order.id },
      select: { id: true }
    })
    if (already) {
      console.log('[markOrderAsPaid] License already linked, skipping', { orderId, licenseId: already.id })
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

    console.log('[markOrderAsPaid] Buscando licença para produto:', order.produtoId, 'storeSlug:', order.storeSlug)

    // Buscar licença disponível
    let candidate = await anyTx.licenca.findFirst({
      where: {
        produtoId: order.produtoId,
        status: 'STOCK',
        orderId: null,
        customerId: null,
        storeSlug: order.storeSlug
      },
      select: { id: true }
    })

    // Fallback: buscar licença sem storeSlug (legada)
    if (!candidate && order.storeSlug) {
      console.log('[markOrderAsPaid] Nenhuma licença com storeSlug, tentando fallback com storeSlug: null')
      candidate = await anyTx.licenca.findFirst({
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

    console.log('[markOrderAsPaid] Licença encontrada:', candidate?.id || 'NENHUMA')

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

    // Vincular licença ao pedido
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

    // Preparar dados para envio de email FORA da transação
    emailPayload = {
      orderId: order.id,
      customerEmail: customer.email,
      produtoNome: produto.nome,
      licenseKey: licenca.chave
    }

    console.log('[markOrderAsPaid] Transação concluída, licença vinculada:', licenca.id, 'email será enviado fora da tx')
  }, {
    maxWait: 10000,
    timeout: 30000
  })

  // ── ENVIO DE EMAIL: fora da transação (SMTP não bloqueia o DB) ──
  if (emailPayload && shouldContinue) {
    const ep = emailPayload
    try {
      const html = renderLicenseEmail({
        produtoNome: ep.produtoNome,
        licenseKey: ep.licenseKey,
        orderId: ep.orderId
      })

      const bcc = String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

      await sendMail({
        to: ep.customerEmail,
        bcc,
        subject: `Sua licença: ${ep.produtoNome}`,
        html
      })

      const now = new Date()
      await (prisma as any).order.update({
        where: { id: ep.orderId },
        data: {
          emailEnviadoEm: now,
          fulfillmentStatus: 'SENT',
          fulfillmentError: null,
          fulfillmentUpdatedAt: now
        }
      })

      console.log('[markOrderAsPaid] Email enviado com sucesso para:', ep.customerEmail)
    } catch (err: any) {
      const msg = String(err?.data?.statusMessage || err?.message || 'Falha ao enviar e-mail')
      console.error('[markOrderAsPaid] Erro ao enviar email:', msg)

      await (prisma as any).order.update({
        where: { id: ep.orderId },
        data: {
          fulfillmentStatus: 'SMTP_ERROR',
          fulfillmentError: msg,
          fulfillmentUpdatedAt: new Date()
        }
      })
    }
  }

  // Telegram notification
  if (telegramReservation && telegramPayload && shouldContinue) {
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
      console.log('[markOrderAsPaid] Telegram send error', err)
      try {
        await prisma.order.updateMany({
          where: { id: reservation.orderId, telegramEnviadoEm: reservation.reservedAt },
          data: { telegramEnviadoEm: null }
        })
      } catch (revertErr) {
        console.log('[markOrderAsPaid] Telegram revert error', revertErr)
      }
    }
  }

  // GA4 tracking
  if (shouldContinue) {
    try {
      await sendGa4PurchaseForOrder(orderId, gateway || 'manual')
    } catch (err) {
      console.log('[markOrderAsPaid] GA4 tracking error', err)
    }
  }

  // Marketplace commission
  if (shouldContinue) {
    try {
      await ensureMarketplaceCommissionForOrder(orderId)
    } catch (err) {
      console.log('[markOrderAsPaid] Marketplace commission error', err)
    }
  }

  console.log('[markOrderAsPaid] COMPLETE', { orderId, source })
}
