import { defineEventHandler, getRouterParam, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { requireAdminSession } from '#root/server/utils/adminSession'
import { renderLicenseEmail, sendMail } from '#root/server/utils/mailer'
import { getStoreContext, whereForStore } from '#root/server/utils/store'

export default defineEventHandler(async (event) => {
  console.log('[manual resend] ===== START =====')
  
  try {
    await requireAdminSession(event)

    const ctx = getStoreContext(event)

    const id = String(getRouterParam(event, 'id') || '').trim()
    console.log('[manual resend] orderId:', id)
    
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'id obrigatório' })
    }

    console.log('[manual resend] Buscando pedido...')
    const order = await (prisma as any).order.findFirst({
      where: whereForStore({ id }, ctx) as any,
      select: {
        id: true,
        status: true,
        storeSlug: true,
        Customer: { select: { email: true } },
        Produto: { select: { nome: true } },
        Licenca: { select: { chave: true } }
      }
    })

    console.log('[manual resend] Pedido encontrado:', order ? 'SIM' : 'NÃO')
    
    if (!order) {
      throw createError({ statusCode: 404, statusMessage: 'Pedido não encontrado' })
    }

    console.log('[manual resend] Order status:', order?.status)

    if (String(order.status || '').toUpperCase() !== 'PAID') {
      throw createError({ statusCode: 400, statusMessage: 'Pedido precisa estar com status PAID' })
    }

    const customerEmail = String(order.Customer?.email || '').trim()
    console.log('[manual resend] Customer email:', customerEmail || '(vazio)')
    
    if (!customerEmail) {
      throw createError({ statusCode: 400, statusMessage: 'E-mail do cliente não encontrado' })
    }

    const produtoNome = String(order.Produto?.nome || '').trim()
    console.log('[manual resend] Produto:', produtoNome || '(vazio)')
    
    if (!produtoNome) {
      throw createError({ statusCode: 400, statusMessage: 'Produto do pedido não encontrado' })
    }

    const licenseKey = String(order.Licenca?.[0]?.chave || '').trim()
    console.log('[manual resend] License count:', order.Licenca?.length || 0)
    console.log('[manual resend] License key present:', licenseKey ? 'SIM' : 'NÃO')
    
    if (!licenseKey) {
      throw createError({ statusCode: 400, statusMessage: 'Pedido ainda não possui licença vinculada' })
    }

    console.log('[manual resend] Gerando email...')
    const html = renderLicenseEmail({
      produtoNome,
      licenseKey,
      orderId: order.id
    })

    const bcc = String(process.env.LICENSE_EMAIL_BCC || '').trim() || 'carloseliastoledo@gmail.com'

    let emailSent = false
    let emailError = ''
    try {
      console.log('[manual resend] Enviando email para:', customerEmail)
      await sendMail({
        to: customerEmail,
        bcc,
        subject: `Sua licença: ${produtoNome}`,
        html
      })
      emailSent = true
      console.log('[manual resend] Email enviado com sucesso')
    } catch (err: any) {
      emailError = String(err?.message || err || 'Erro ao enviar email')
      console.error('[manual resend] SMTP error:', emailError)
    }

    console.log('[manual resend] Atualizando status do pedido...')
    await (prisma as any).order.update({
      where: { id: order.id },
      data: {
        emailEnviadoEm: emailSent ? new Date() : undefined,
        fulfillmentStatus: emailSent ? 'RESENT' : 'SMTP_ERROR',
        fulfillmentError: emailSent ? null : emailError,
        fulfillmentUpdatedAt: new Date()
      }
    })

    if (!emailSent) {
      throw createError({ statusCode: 502, statusMessage: `Falha ao enviar email: ${emailError}` })
    }

    console.log('[manual resend] ===== END =====')

    return {
      ok: true,
      message: 'Licença reenviada com sucesso',
      orderId: order.id,
      customerEmail,
      produtoNome
    }
    
  } catch (err: any) {
    console.error('[manual resend] ===== ERROR =====')
    console.error('[manual resend] error:', err)
    console.error('[manual resend] message:', err?.message)
    console.error('[manual resend] code:', err?.code)
    console.error('[manual resend] meta:', err?.meta)
    
    throw createError({ 
      statusCode: err?.statusCode || 503, 
      statusMessage: err?.statusMessage || `Erro: ${err?.message || 'Erro desconhecido'}` 
    })
  }
})
