import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  return {
    ok: true,
    now: new Date().toISOString()
  }
})
