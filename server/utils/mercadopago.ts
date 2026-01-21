import { createError } from 'h3'
import { MercadoPagoConfig, Payment } from 'mercadopago'

export function getMpAccessToken() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''
  if (!accessToken) {
    throw createError({ statusCode: 500, statusMessage: 'MERCADOPAGO_ACCESS_TOKEN não configurado' })
  }
  return accessToken
}

export function getMpClient() {
  const accessToken = getMpAccessToken()
  return new MercadoPagoConfig({ accessToken })
}

export function getMpPayment() {
  const client = getMpClient()
  return new Payment(client)
}
