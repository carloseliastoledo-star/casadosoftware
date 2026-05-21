import prisma from '#root/server/db/prisma'
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id

    // Buscar lead no banco
    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead WHERE id = ? LIMIT 1
    `, id)

    if (!leads || leads.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Lead não encontrado'
      })
    }

    const lead = leads[0]

    if (!lead.email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Lead não possui e-mail'
      })
    }

    // Buscar produto Office 365
    const produto = await (prisma as any).produto.findFirst({
      where: { slug: 'office-365', ativo: true },
      select: { id: true, nome: true, preco: true }
    })

    if (!produto) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Produto Office 365 não encontrado'
      })
    }

    // Gerar checkout URL usando o endpoint de checkout existente
    // Para simplificar, vamos gerar uma URL direta para a página de checkout
    const checkoutUrl = `https://casadosoftware.com.br/checkout?produtoId=${produto.id}&email=${encodeURIComponent(lead.email)}&nome=${encodeURIComponent(lead.name)}`

    // Atualizar lead com checkoutUrl
    await prisma.$executeRawUnsafe(`
      UPDATE Office365TrialLead 
      SET checkoutUrl = ?, updatedAt = NOW()
      WHERE id = ?
    `, checkoutUrl, id)

    return {
      success: true,
      checkoutUrl
    }

  } catch (error: any) {
    console.error('[api/admin/office365-trials/[id]/generate-checkout] error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao gerar checkout'
    })
  }
})
