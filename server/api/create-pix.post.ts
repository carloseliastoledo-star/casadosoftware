import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'

function round2(n: number) { return Math.round(n * 100) / 100 }

export default defineEventHandler(async (event) => {
  console.log('[create-pix] ===== START =====', new Date().toISOString())
  
  const body = await readBody(event)
  
  // Aceitar tanto phone quanto telefone, nome quanto name
  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = String(body?.nome || body?.name || '').trim()
  const document = String(body?.document || body?.cpf || '').trim()
  const phone = String(body?.phone || body?.telefone || '').trim()
  const method = String(body?.method || 'pix').trim().toLowerCase()
  const currency = String(body?.currency || 'BRL').trim().toUpperCase()
  const cartItems = Array.isArray(body?.cartItems) ? body.cartItems : []
  
  // Logs seguros
  console.log('[create-pix] token exists:', !!process.env.MERCADOPAGO_ACCESS_TOKEN)
  console.log('[create-pix] email exists:', !!email && email.includes('@'))
  console.log('[create-pix] document length:', document.replace(/\D/g, '').length)
  console.log('[create-pix] phone exists:', !!phone)
  console.log('[create-pix] cartItems length:', cartItems.length)
  console.log('[create-pix] method:', method)
  console.log('[create-pix] currency:', currency)
  
  // Validar token do Mercado Pago
  const mpToken = String(process.env.MERCADOPAGO_ACCESS_TOKEN || '').trim()
  if (!mpToken || mpToken.length < 10) {
    console.error('[create-pix] ERROR: MERCADOPAGO_ACCESS_TOKEN not configured')
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração de pagamento indisponível',
      data: { code: 'MP_TOKEN_MISSING', message: 'Token do Mercado Pago não configurado' }
    })
  }
  
  // Validar campos obrigatórios
  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido',
      data: { code: 'INVALID_EMAIL', message: 'Email é obrigatório e deve ser válido' }
    })
  }
  
  if (!nome) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nome inválido',
      data: { code: 'INVALID_NAME', message: 'Nome é obrigatório' }
    })
  }
  
  const cleanDocument = document.replace(/\D/g, '')
  if (!cleanDocument || cleanDocument.length < 11) {
    throw createError({
      statusCode: 400,
      statusMessage: 'CPF inválido',
      data: { code: 'INVALID_DOCUMENT', message: 'CPF deve ter pelo menos 11 dígitos' }
    })
  }
  
  if (method !== 'pix') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Método de pagamento inválido',
      data: { code: 'INVALID_METHOD', message: 'Este endpoint aceita apenas pagamento PIX' }
    })
  }
  
  // Calcular amount a partir dos produtos no banco
  let amountBrl = 0
  try {
    console.log('[create-pix] calculating amount from products')
    
    if (cartItems.length > 0) {
      for (const item of cartItems) {
        const productId = String(item.productId || '').trim()
        const quantity = Number(item.quantity || 1)
        
        if (!productId) continue
        
        const produto = await prisma.produto.findFirst({
          where: { id: productId, ativo: true },
          select: { id: true, nome: true, preco: true },
        })
        
        if (!produto) {
          console.warn('[create-pix] Produto não encontrado:', productId)
          continue
        }
        
        const unitPrice = round2(produto.preco || 0)
        const itemTotal = round2(unitPrice * quantity)
        amountBrl = round2(amountBrl + itemTotal)
        
        console.log('[create-pix] item:', productId, 'price:', unitPrice, 'quantity:', quantity, 'total:', itemTotal)
      }
    } else {
      // Se não tem cartItems, buscar pelo produtoId direto
      const produto = await prisma.produto.findFirst({
        where: { id: produtoId, ativo: true },
        select: { id: true, nome: true, preco: true },
      })
      
      if (!produto) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Produto não encontrado',
          data: { code: 'PRODUCT_NOT_FOUND', message: 'Produto não encontrado' }
        })
      }
      
      amountBrl = round2(produto.preco || 0)
      console.log('[create-pix] single product amount:', amountBrl)
    }
    
    console.log('[create-pix] total amount:', amountBrl)
    
    if (amountBrl <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Valor inválido',
        data: { code: 'INVALID_AMOUNT', message: 'Valor deve ser maior que zero' }
      })
    }
  } catch (err: any) {
    console.error('[create-pix] error calculating amount:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao calcular valor',
      data: { code: 'AMOUNT_ERROR', message: 'Erro ao calcular valor do pedido' }
    })
  }
  
  // Preparar payload para Mercado Pago PIX (SEM items)
  const nameParts = nome.trim().split(/\s+/)
  const firstName = nameParts[0] || 'Cliente'
  const lastName = nameParts.slice(1).join(' ') || firstName
  
  const siteUrl = String(process.env.SITE_URL || '').replace(/\/$/, '')
  const orderId = `pix-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
  
  const mpBody: any = {
    transaction_amount: amountBrl,
    description: 'Pedido PIX',
    payment_method_id: 'pix',
    external_reference: orderId,
    date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    payer: {
      email: email,
      first_name: firstName,
      last_name: lastName,
      identification: {
        type: 'CPF',
        number: cleanDocument,
      },
    },
  }
  
  if (siteUrl) {
    mpBody.notification_url = `${siteUrl}/api/mercadopago/webhook`
  }
  
  console.log('[create-pix] calling Mercado Pago API directly (without items)')
  console.log('[create-pix] amount:', amountBrl)
  console.log('[create-pix] payment_method_id:', mpBody.payment_method_id)
  
  try {
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${mpToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pix-${orderId}`,
      },
      body: JSON.stringify(mpBody),
    })
    
    console.log('[create-pix] Mercado Pago status:', mpResponse.status)
    
    const mpData = await mpResponse.json()
    
    if (!mpResponse.ok) {
      console.error('[create-pix] Mercado Pago error:', JSON.stringify(mpData, null, 2))
      throw createError({
        statusCode: mpResponse.status,
        statusMessage: mpData.message || 'Erro no Mercado Pago',
        data: {
          code: 'MERCADO_PAGO_ERROR',
          message: mpData.message || mpData.error || 'Erro ao processar pagamento PIX',
          details: mpData
        }
      })
    }
    
    console.log('[create-pix] Mercado Pago success:', { payment_id: mpData.id })
    
    const txData = mpData?.point_of_interaction?.transaction_data
    
    return {
      payment_id: String(mpData.id),
      status: mpData.status,
      qr_code: txData?.qr_code || '',
      qr_code_base64: txData?.qr_code_base64 || '',
      ticket_url: txData?.ticket_url || '',
      external_reference: mpData.external_reference,
      date_of_expiration: mpData.date_of_expiration
    }
  } catch (err: any) {
    console.error('[create-pix] ===== ERROR =====')
    console.error('[create-pix] error message:', err?.message)
    console.error('[create-pix] error statusCode:', err?.statusCode)
    console.error('[create-pix] error data:', err?.data)
    
    // Retornar erro claro para o frontend
    const statusCode = err?.statusCode || err?.status || 500
    const statusMessage = err?.statusMessage || err?.message || 'Erro ao processar pagamento PIX'
    
    throw createError({
      statusCode,
      statusMessage,
      data: {
        code: err?.data?.code || 'PIX_ERROR',
        message: statusMessage,
        details: err?.data?.message || err?.data || null
      }
    })
  }
})
