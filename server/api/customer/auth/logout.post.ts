import { defineEventHandler } from 'h3'
import { clearCustomerSession } from '../../../utils/customerSession'

export default defineEventHandler(async (event) => {
  clearCustomerSession(event)
  return { ok: true }
})
