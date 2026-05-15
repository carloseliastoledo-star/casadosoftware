/**
 * Helper para classificar a origem do tráfego/sale
 * Baseado nos campos de tracking do Order
 */

export type TrafficChannel =
  | 'google_ads'
  | 'meta_ads'
  | 'google_organic'
  | 'referral'
  | 'landing_page'
  | 'blog'
  | 'direct'
  | 'unknown'

export interface TrafficSourceInfo {
  channel: TrafficChannel
  channelLabel: string
  campaign?: string | null
  source?: string | null
  medium?: string | null
  color: string
}

/**
 * Classifica a origem do pedido baseado nos campos de tracking
 */
export function classifyTrafficSource(order: any): TrafficSourceInfo {
  const utmSource = String(order?.utmSource || '').toLowerCase()
  const utmMedium = String(order?.utmMedium || '').toLowerCase()
  const utmCampaign = order?.utmCampaign
  const gclid = order?.gclid
  const fbclid = order?.fbclid
  const referrer = String(order?.referrer || '').toLowerCase()
  const landingPage = String(order?.landingPage || '').toLowerCase()
  const lastTouchSource = String(order?.lastTouchSource || '').toLowerCase()
  const lastTouchMedium = String(order?.lastTouchMedium || '').toLowerCase()
  const firstTouchSource = String(order?.firstTouchSource || '').toLowerCase()
  const firstTouchGclid = order?.firstTouchGclid
  const firstTouchFbclid = order?.firstTouchFbclid

  // Prioridade: Last Touch > First Touch > UTM direto
  const effectiveSource = lastTouchSource || utmSource || firstTouchSource
  const effectiveMedium = lastTouchMedium || utmMedium
  const effectiveGclid = order?.lastTouchGclid || gclid || firstTouchGclid
  const effectiveFbclid = order?.lastTouchFbclid || fbclid || firstTouchFbclid

  // Google Ads (gclid ou utm_medium=cpc/ppc/paid)
  if (
    effectiveGclid ||
    effectiveMedium === 'cpc' ||
    effectiveMedium === 'ppc' ||
    effectiveMedium === 'paid' ||
    effectiveMedium === 'paidsearch'
  ) {
    return {
      channel: 'google_ads',
      channelLabel: 'Google Ads',
      campaign: order?.lastTouchCampaign || utmCampaign || order?.firstTouchCampaign,
      source: effectiveSource || 'google',
      medium: effectiveMedium || 'cpc',
      color: '#4285F4' // Azul Google
    }
  }

  // Meta Ads (fbclid ou source facebook/instagram/meta)
  if (
    effectiveFbclid ||
    effectiveSource.includes('facebook') ||
    effectiveSource.includes('instagram') ||
    effectiveSource.includes('meta') ||
    effectiveSource.includes('fb')
  ) {
    return {
      channel: 'meta_ads',
      channelLabel: 'Meta Ads',
      campaign: order?.lastTouchCampaign || utmCampaign || order?.firstTouchCampaign,
      source: effectiveSource || 'facebook',
      medium: effectiveMedium || 'social',
      color: '#1877F2' // Azul Facebook
    }
  }

  // Google Orgânico
  if (
    (effectiveSource.includes('google') && effectiveMedium === 'organic') ||
    (!effectiveSource && !effectiveMedium && referrer.includes('google.'))
  ) {
    return {
      channel: 'google_organic',
      channelLabel: 'Google Orgânico',
      campaign: utmCampaign,
      source: 'google',
      medium: 'organic',
      color: '#34A853' // Verde Google
    }
  }

  // Landing Page
  if (landingPage.includes('/lp/') || landingPage.includes('/landing/')) {
    return {
      channel: 'landing_page',
      channelLabel: 'Landing Page',
      campaign: utmCampaign,
      source: utmSource,
      medium: utmMedium,
      color: '#FBBC04' // Amarelo
    }
  }

  // Blog
  if (landingPage.includes('/blog/')) {
    return {
      channel: 'blog',
      channelLabel: 'Blog',
      campaign: utmCampaign,
      source: utmSource,
      medium: utmMedium,
      color: '#9C27B0' // Roxo
    }
  }

  // Referral (tem referrer externo)
  if (
    referrer &&
    !referrer.includes('casadosoftware') &&
    !referrer.includes('localhost') &&
    !referrer.includes('127.0.0.1')
  ) {
    return {
      channel: 'referral',
      channelLabel: 'Referral',
      campaign: utmCampaign,
      source: utmSource || referrer,
      medium: utmMedium || 'referral',
      color: '#FF9800' // Laranja
    }
  }

  // Direto (sem dados de tracking)
  if (!utmSource && !utmMedium && !gclid && !fbclid && !referrer) {
    return {
      channel: 'direct',
      channelLabel: 'Direto',
      campaign: null,
      source: 'direct',
      medium: 'none',
      color: '#757575' // Cinza
    }
  }

  // Desconhecido (tem algum dado mas não classificou)
  return {
    channel: 'unknown',
    channelLabel: 'Desconhecido',
    campaign: utmCampaign,
    source: utmSource || null,
    medium: utmMedium || null,
    color: '#9E9E9E' // Cinza claro
  }
}

/**
 * Agrupa pedidos por canal de origem
 */
export function groupOrdersByChannel(orders: any[]) {
  const groups: Record<string, {
    channel: TrafficChannel
    label: string
    color: string
    orders: any[]
    totalRevenue: number
    campaigns: Map<string, number>
  }> = {}

  for (const order of orders) {
    const source = classifyTrafficSource(order)

    if (!groups[source.channel]) {
      groups[source.channel] = {
        channel: source.channel,
        label: source.channelLabel,
        color: source.color,
        orders: [],
        totalRevenue: 0,
        campaigns: new Map()
      }
    }

    const group = groups[source.channel]
    group.orders.push(order)
    group.totalRevenue += Number(order?.totalAmount || 0)

    // Contar campanhas
    const campaign = source.campaign || '(sem campanha)'
    group.campaigns.set(campaign, (group.campaigns.get(campaign) || 0) + 1)
  }

  // Converter para array e calcular métricas
  return Object.values(groups).map(group => {
    const sortedCampaigns = Array.from(group.campaigns.entries())
      .sort((a, b) => b[1] - a[1]) // Ordenar por quantidade

    const mainCampaign = sortedCampaigns[0]?.[0] !== '(sem campanha)'
      ? sortedCampaigns[0]?.[0]
      : sortedCampaigns[1]?.[0] || null

    // Encontrar última venda
    const lastOrder = group.orders
      .filter(o => o.pagoEm)
      .sort((a, b) => new Date(b.pagoEm).getTime() - new Date(a.pagoEm).getTime())[0]

    return {
      channel: group.channel,
      label: group.label,
      color: group.color,
      orderCount: group.orders.length,
      totalRevenue: Math.round(group.totalRevenue * 100) / 100,
      averageTicket: group.orders.length > 0
        ? Math.round((group.totalRevenue / group.orders.length) * 100) / 100
        : 0,
      lastSaleAt: lastOrder?.pagoEm || null,
      mainCampaign: mainCampaign,
      topCampaigns: sortedCampaigns.slice(0, 3).map(([name, count]) => ({ name, count }))
    }
  }).sort((a, b) => b.totalRevenue - a.totalRevenue) // Ordenar por receita
}
