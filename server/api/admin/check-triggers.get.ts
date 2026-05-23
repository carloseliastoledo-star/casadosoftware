import { defineEventHandler } from 'h3'
import prisma from '../../../db/prisma'

export default defineEventHandler(async () => {
  try {
    // Verificar triggers
    const triggers = await prisma.$queryRawUnsafe(`
      SHOW TRIGGERS
    `)

    // Verificar events
    const events = await prisma.$queryRawUnsafe(`
      SHOW EVENTS
    `)

    return {
      ok: true,
      triggers,
      events
    }
  } catch (err: any) {
    console.error('[check-triggers] Error:', err)
    return {
      ok: false,
      error: err?.message || 'Erro ao verificar triggers/events'
    }
  }
})
