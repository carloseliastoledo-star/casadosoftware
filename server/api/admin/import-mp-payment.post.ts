import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  console.log('[import-mp-payment] ===== START =====', new Date().toISOString())
  
  const body = await readBody(event)
  
  const paymentId = String(body?.paymentId || '').trim()
  const produtoId = String(body?.produtoId || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const nome = String(body?.nome || '').trim()
  const externalReference = String(body?.externalReference || '').trim()
  const valor = Number(body?.valor || 0)
  const status = String(body?.status || '').trim()
  
  console.log('[import-mp-payment] paymentId:', paymentId)
  console.log('[import-mp-payment] produtoId:', produtoId)
  console.log('[import-mp-payment] email:', email)
  console.log('[import-mp-payment] valor:', valor)
  console.log('[import-mp-payment] status:', status)
  
  // Validar campos obrigatórios
  if (!paymentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Payment ID é obrigatório'
    })
  }
  
  if (!produtoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Produto ID é obrigatório'
    })
  }
  
  if (!email || !email.includes('@')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email inválido'
    })
  }
  
  if (!nome) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nome é obrigatório'
    })
  }
  
  if (valor <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valor deve ser maior que zero'
    })
  }
  
  // Verificar se o produto existe
  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, ativo: true },
    select: { id: true, nome: true, preco: true }
  })
  
  if (!produto) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Produto não encontrado'
    })
  }
  
  // Verificar se já existe pedido com esse paymentId
  const existingOrder = await prisma.order.findFirst({
    where: { mercadoPagoPaymentId: paymentId }
  })
  
  if (existingOrder) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Já existe um pedido com este Payment ID'
    })
  }
  
  const storeSlug = process.env.STORE_SLUG || 'casadosoftware'
  
  try {
    // Criar pedido no banco
    const order = await prisma.order.create({
      data: {
        status: status === 'approved' ? 'PAID' : 'PENDING',
        storeSlug,
        totalAmount: valor,
        customerEmail: email,
        customerName: nome,
        produtoId,
        mercadoPagoPaymentId: paymentId,
        externalReference: externalReference || null,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      }
    })
    
    console.log('[import-mp-payment] Pedido criado:', order.id)
    
    return {
      ok: true,
      orderId: order.id,
      message: 'Pagamento importado com sucesso'
    }
  } catch (err: any) {
    console.error('[import-mp-payment] Erro ao criar pedido:', err)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao importar pagamento',
      data: { error: err?.message }
    })
  }
})
