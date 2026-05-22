import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  // Endpoint GET simples para evitar erro 500 quando chamado pelo frontend
  // O endpoint POST é o que realmente salva os leads
  return { ok: true, message: 'use POST to create abandoned checkout' }
})
