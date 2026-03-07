import { defineEventHandler } from 'h3'
import { clearAffiliateSession } from '../../../utils/affiliateSession'

export default defineEventHandler(async (event) => {
  clearAffiliateSession(event)
  return { ok: true }
})
