import { createError } from 'h3'

type WooConfig = {
  baseUrl: string
  consumerKey: string
  consumerSecret: string
}

function getWooConfig(): WooConfig {
  const baseUrl = String(process.env.WOOCOMMERCE_BASE_URL || '').trim().replace(/\/$/, '')
  const consumerKey = String(process.env.WOOCOMMERCE_CONSUMER_KEY || '').trim()
  const consumerSecret = String(process.env.WOOCOMMERCE_CONSUMER_SECRET || '').trim()

  if (!baseUrl || !consumerKey || !consumerSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WooCommerce não configurado (envs WOOCOMMERCE_BASE_URL/WOOCOMMERCE_CONSUMER_KEY/WOOCOMMERCE_CONSUMER_SECRET)'
    })
  }

  return { baseUrl, consumerKey, consumerSecret }
}

export type WooOrder = {
  id: number
  status: string
  currency: string
  total: string
  customer_id: number
  date_created: string
  billing?: {
    email?: string
    first_name?: string
    last_name?: string
    phone?: string
  }
  line_items?: Array<{
    name?: string
    quantity?: number
    total?: string
  }>
}

export type WooProductCategory = {
  id: number
  name: string
  slug: string
}

export type WooProduct = {
  id: number
  name: string
  slug?: string
  permalink?: string
  link?: string
  price?: string
  regular_price?: string
  description?: string
  short_description?: string
  images?: Array<{ src?: string }>
  categories?: Array<{ id: number; name?: string; slug?: string }>
}

export async function wooGetOrders(params: {
  after?: string
  page: number
  per_page: number
}): Promise<WooOrder[]> {
  const { baseUrl, consumerKey, consumerSecret } = getWooConfig()

  const url = new URL(`${baseUrl}/wp-json/wc/v3/orders`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('per_page', String(params.per_page))
  url.searchParams.set('orderby', 'date')
  url.searchParams.set('order', 'desc')
  if (params.after) {
    url.searchParams.set('after', params.after)
  }

  return await $fetch<WooOrder[]>(url.toString(), {
    method: 'GET'
  })
}

export async function wooGetProductCategories(params: {
  page: number
  per_page: number
}): Promise<WooProductCategory[]> {
  const { baseUrl, consumerKey, consumerSecret } = getWooConfig()

  const url = new URL(`${baseUrl}/wp-json/wc/v3/products/categories`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('per_page', String(params.per_page))
  url.searchParams.set('orderby', 'id')
  url.searchParams.set('order', 'asc')

  return await $fetch<WooProductCategory[]>(url.toString(), {
    method: 'GET'
  })
}

export async function wooGetProducts(params: {
  page: number
  per_page: number
}): Promise<WooProduct[]> {
  const { baseUrl, consumerKey, consumerSecret } = getWooConfig()

  const url = new URL(`${baseUrl}/wp-json/wc/v3/products`)
  url.searchParams.set('consumer_key', consumerKey)
  url.searchParams.set('consumer_secret', consumerSecret)
  url.searchParams.set('page', String(params.page))
  url.searchParams.set('per_page', String(params.per_page))
  url.searchParams.set('orderby', 'id')
  url.searchParams.set('order', 'asc')

  return await $fetch<WooProduct[]>(url.toString(), {
    method: 'GET'
  })
}
