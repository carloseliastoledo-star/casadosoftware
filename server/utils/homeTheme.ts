const DANGEROUS_PATTERN = /<\s*(script|iframe|object|embed|form|svg|math)/i
const ATTR_PATTERN = /\s(on\w+|javascript:|data:)\s*=/i
const UNSAFE_PROTO = /javascript:/i

const MAX_TITLE = 200
const MAX_BODY = 500
const MAX_URL = 500
const MAX_BADGE = 100
const MAX_SEO_TITLE = 200
const MAX_SEO_DESC = 500
const MAX_SLUGS = 20

export type HomeTheme = {
  schemaVersion: 1
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    mutedText: string
  }
  sections: {
    hero: boolean
    benefits: boolean
    products: boolean
    steps: boolean
    faq: boolean
    cta: boolean
  }
  hero: {
    badge: string
    title: string
    subtitle: string
    primaryCtaLabel: string
    primaryCtaUrl: string
    secondaryCtaLabel: string
    secondaryCtaUrl: string
    imageUrl: string
  }
  benefits: Array<{
    enabled: boolean
    icon: string
    title: string
    body: string
  }>
  products: {
    enabled: boolean
    title: string
    subtitle: string
    productSlugs: string[]
  }
  steps: Array<{
    enabled: boolean
    title: string
    body: string
  }>
  faq: Array<{
    enabled: boolean
    question: string
    answer: string
  }>
  cta: {
    enabled: boolean
    kicker: string
    title: string
    subtitle: string
    buttonLabel: string
    buttonUrl: string
  }
  seo: {
    title: string
    description: string
    ogImage: string
  }
}

export function defaultHomeTheme(): HomeTheme {
  return {
    schemaVersion: 1,
    colors: {
      primary: '#2563eb',
      secondary: '#0f172a',
      accent: '#22c55e',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#111827',
      mutedText: '#64748b'
    },
    sections: {
      hero: true,
      benefits: true,
      products: true,
      steps: true,
      faq: true,
      cta: true
    },
    hero: {
      badge: 'Entrega imediata',
      title: 'Software original com entrega rápida',
      subtitle: 'Licenças digitais para Windows, Office e produtividade com suporte especializado.',
      primaryCtaLabel: 'Ver ofertas',
      primaryCtaUrl: '/produtos',
      secondaryCtaLabel: 'Falar no WhatsApp',
      secondaryCtaUrl: '/contato',
      imageUrl: ''
    },
    benefits: [
      { enabled: true, icon: 'shield', title: 'Compra segura', body: 'Atendimento profissional e entrega digital.' },
      { enabled: true, icon: 'zap', title: 'Entrega rápida', body: 'Receba sua licença e instruções logo após a confirmação.' },
      { enabled: true, icon: 'headphones', title: 'Suporte incluso', body: 'Ajuda para instalação e ativação.' }
    ],
    products: {
      enabled: true,
      title: 'Mais vendidos',
      subtitle: 'Produtos mais procurados da loja.',
      productSlugs: []
    },
    steps: [
      { enabled: true, title: 'Escolha o produto', body: 'Selecione a licença ideal para você.' },
      { enabled: true, title: 'Faça o pagamento', body: 'Finalize pelo checkout seguro.' },
      { enabled: true, title: 'Receba por e-mail', body: 'Acesse as instruções de instalação e ativação.' }
    ],
    faq: [
      { enabled: true, question: 'A entrega é digital?', answer: 'Sim. O produto é enviado digitalmente com instruções de uso.' },
      { enabled: true, question: 'Tem suporte?', answer: 'Sim. O suporte auxilia no processo de instalação e ativação.' }
    ],
    cta: {
      enabled: true,
      kicker: 'Pronto para comprar?',
      title: 'Escolha sua licença e receba com rapidez',
      subtitle: 'Atendimento profissional antes e depois da compra.',
      buttonLabel: 'Comprar agora',
      buttonUrl: '/produtos'
    },
    seo: {
      title: 'Licenças digitais com entrega rápida',
      description: 'Compre licenças digitais para Windows, Office e produtividade com entrega rápida e suporte.',
      ogImage: ''
    }
  }
}

function isSafeString(v: unknown): boolean {
  if (typeof v !== 'string') return false
  if (DANGEROUS_PATTERN.test(v)) return false
  if (ATTR_PATTERN.test(v)) return false
  return true
}

function isSafeUrl(v: unknown): boolean {
  if (typeof v !== 'string') return false
  const s = String(v).trim()
  if (s === '') return true
  if (UNSAFE_PROTO.test(s)) return false
  if (DANGEROUS_PATTERN.test(s)) return false
  if (s.startsWith('/')) return true
  if (s.startsWith('https://')) return true
  return false
}

function isHex(v: unknown): boolean {
  return typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v)
}

function safeStr(v: unknown, max: number, fallback = ''): string {
  if (!isSafeString(v)) return fallback
  return String(v).slice(0, max)
}

function safeUrl(v: unknown, max: number, fallback = ''): string {
  if (!isSafeUrl(v)) return fallback
  return String(v).slice(0, max)
}

function safeBool(v: unknown, fallback = true): boolean {
  if (typeof v === 'boolean') return v
  return fallback
}

export type ValidateResult =
  | { ok: true; theme: HomeTheme }
  | { ok: false; error: string }

export function validateHomeTheme(raw: unknown): ValidateResult {
  if (raw === null || raw === undefined || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'theme_not_object' }
  }

  const r = raw as Record<string, unknown>

  if ((r.schemaVersion as number) !== 1) {
    return { ok: false, error: 'unsupported_schema_version' }
  }

  const def = defaultHomeTheme()

  // colors
  const colorsRaw = r.colors && typeof r.colors === 'object' && !Array.isArray(r.colors)
    ? (r.colors as Record<string, unknown>)
    : {}

  const colors: HomeTheme['colors'] = {
    primary: isHex(colorsRaw.primary) ? String(colorsRaw.primary) : def.colors.primary,
    secondary: isHex(colorsRaw.secondary) ? String(colorsRaw.secondary) : def.colors.secondary,
    accent: isHex(colorsRaw.accent) ? String(colorsRaw.accent) : def.colors.accent,
    background: isHex(colorsRaw.background) ? String(colorsRaw.background) : def.colors.background,
    surface: isHex(colorsRaw.surface) ? String(colorsRaw.surface) : def.colors.surface,
    text: isHex(colorsRaw.text) ? String(colorsRaw.text) : def.colors.text,
    mutedText: isHex(colorsRaw.mutedText) ? String(colorsRaw.mutedText) : def.colors.mutedText
  }

  // sections
  const sectionsRaw = r.sections && typeof r.sections === 'object' && !Array.isArray(r.sections)
    ? (r.sections as Record<string, unknown>)
    : {}

  const sections: HomeTheme['sections'] = {
    hero: safeBool(sectionsRaw.hero),
    benefits: safeBool(sectionsRaw.benefits),
    products: safeBool(sectionsRaw.products),
    steps: safeBool(sectionsRaw.steps),
    faq: safeBool(sectionsRaw.faq),
    cta: safeBool(sectionsRaw.cta)
  }

  // hero
  const heroRaw = r.hero && typeof r.hero === 'object' && !Array.isArray(r.hero)
    ? (r.hero as Record<string, unknown>)
    : {}

  const hero: HomeTheme['hero'] = {
    badge: safeStr(heroRaw.badge, MAX_BADGE, def.hero.badge),
    title: safeStr(heroRaw.title, MAX_TITLE, def.hero.title),
    subtitle: safeStr(heroRaw.subtitle, MAX_BODY, def.hero.subtitle),
    primaryCtaLabel: safeStr(heroRaw.primaryCtaLabel, MAX_TITLE, def.hero.primaryCtaLabel),
    primaryCtaUrl: safeUrl(heroRaw.primaryCtaUrl, MAX_URL, def.hero.primaryCtaUrl),
    secondaryCtaLabel: safeStr(heroRaw.secondaryCtaLabel, MAX_TITLE, def.hero.secondaryCtaLabel),
    secondaryCtaUrl: safeUrl(heroRaw.secondaryCtaUrl, MAX_URL, def.hero.secondaryCtaUrl),
    imageUrl: safeUrl(heroRaw.imageUrl, MAX_URL, '')
  }

  // benefits
  const benefitsRaw = Array.isArray(r.benefits) ? r.benefits.slice(0, 10) : def.benefits
  const benefits: HomeTheme['benefits'] = benefitsRaw.map((b: unknown, i: number) => {
    const br = b && typeof b === 'object' && !Array.isArray(b) ? (b as Record<string, unknown>) : {}
    const fallback = def.benefits[i] || { enabled: true, icon: 'shield', title: '', body: '' }
    return {
      enabled: safeBool(br.enabled),
      icon: safeStr(br.icon, 32, fallback.icon),
      title: safeStr(br.title, MAX_TITLE, fallback.title),
      body: safeStr(br.body, MAX_BODY, fallback.body)
    }
  })

  // products
  const productsRaw = r.products && typeof r.products === 'object' && !Array.isArray(r.products)
    ? (r.products as Record<string, unknown>)
    : {}
  const rawSlugs = Array.isArray(productsRaw.productSlugs) ? productsRaw.productSlugs : []
  const productSlugs = rawSlugs
    .slice(0, MAX_SLUGS)
    .map((s: unknown) => String(s || '').trim().replace(/[^a-z0-9\-]/g, '').slice(0, 120))
    .filter((s: string) => s.length > 0)

  const products: HomeTheme['products'] = {
    enabled: safeBool(productsRaw.enabled),
    title: safeStr(productsRaw.title, MAX_TITLE, def.products.title),
    subtitle: safeStr(productsRaw.subtitle, MAX_BODY, def.products.subtitle),
    productSlugs
  }

  // steps
  const stepsRaw = Array.isArray(r.steps) ? r.steps.slice(0, 10) : def.steps
  const steps: HomeTheme['steps'] = stepsRaw.map((s: unknown, i: number) => {
    const sr = s && typeof s === 'object' && !Array.isArray(s) ? (s as Record<string, unknown>) : {}
    const fallback = def.steps[i] || { enabled: true, title: '', body: '' }
    return {
      enabled: safeBool(sr.enabled),
      title: safeStr(sr.title, MAX_TITLE, fallback.title),
      body: safeStr(sr.body, MAX_BODY, fallback.body)
    }
  })

  // faq
  const faqRaw = Array.isArray(r.faq) ? r.faq.slice(0, 20) : def.faq
  const faq: HomeTheme['faq'] = faqRaw.map((f: unknown, i: number) => {
    const fr = f && typeof f === 'object' && !Array.isArray(f) ? (f as Record<string, unknown>) : {}
    const fallback = def.faq[i] || { enabled: true, question: '', answer: '' }
    return {
      enabled: safeBool(fr.enabled),
      question: safeStr(fr.question, MAX_TITLE, fallback.question),
      answer: safeStr(fr.answer, MAX_BODY, fallback.answer)
    }
  })

  // cta
  const ctaRaw = r.cta && typeof r.cta === 'object' && !Array.isArray(r.cta)
    ? (r.cta as Record<string, unknown>)
    : {}

  const cta: HomeTheme['cta'] = {
    enabled: safeBool(ctaRaw.enabled),
    kicker: safeStr(ctaRaw.kicker, MAX_BADGE, def.cta.kicker),
    title: safeStr(ctaRaw.title, MAX_TITLE, def.cta.title),
    subtitle: safeStr(ctaRaw.subtitle, MAX_BODY, def.cta.subtitle),
    buttonLabel: safeStr(ctaRaw.buttonLabel, MAX_TITLE, def.cta.buttonLabel),
    buttonUrl: safeUrl(ctaRaw.buttonUrl, MAX_URL, def.cta.buttonUrl)
  }

  // seo
  const seoRaw = r.seo && typeof r.seo === 'object' && !Array.isArray(r.seo)
    ? (r.seo as Record<string, unknown>)
    : {}

  const seo: HomeTheme['seo'] = {
    title: safeStr(seoRaw.title, MAX_SEO_TITLE, def.seo.title),
    description: safeStr(seoRaw.description, MAX_SEO_DESC, def.seo.description),
    ogImage: safeUrl(seoRaw.ogImage, MAX_URL, '')
  }

  const theme: HomeTheme = {
    schemaVersion: 1,
    colors,
    sections,
    hero,
    benefits,
    products,
    steps,
    faq,
    cta,
    seo
  }

  return { ok: true, theme }
}

export function parseHomeThemeJson(raw: string | null | undefined): HomeTheme | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const result = validateHomeTheme(parsed)
    if (!result.ok) return null
    return result.theme
  } catch {
    return null
  }
}
