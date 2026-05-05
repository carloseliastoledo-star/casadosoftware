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
