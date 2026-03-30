import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  const dbUrl = process.env.DATABASE_URL || ''
  const masked = dbUrl
    ? dbUrl.replace(/:([^:@]+)@/, ':***@').substring(0, 100)
    : '(not set)'

  const stripeSecret = process.env.STRIPE_SECRET_KEY || ''
  const stripePub = process.env.STRIPE_PUBLISHABLE_KEY || ''
  const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET || ''
  const spacesKey = process.env.SPACES_KEY || ''
  const spacesSecret = process.env.SPACES_SECRET || ''
  const spacesBucket = process.env.SPACES_BUCKET || ''
  const spacesEndpoint = process.env.SPACES_ENDPOINT || ''

  return {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    dbUrlSet: !!dbUrl,
    dbUrlLength: dbUrl.length,
    dbUrlPreview: masked,
    dbUrlStartsWith: dbUrl.substring(0, 10),
    nitroPreset: process.env.NITRO_PRESET,
    storeSlug: process.env.STORE_SLUG,
    siteUrl: process.env.SITE_URL,
    stripe: {
      secretKeySet: !!stripeSecret,
      secretKeyPreview: stripeSecret ? `${stripeSecret.substring(0, 7)}...` : '(not set)',
      isTestMode: stripeSecret.startsWith('sk_test_'),
      publishableKeySet: !!stripePub,
      publishableKeyPreview: stripePub ? `${stripePub.substring(0, 7)}...` : '(not set)',
      webhookSecretSet: !!stripeWebhook
    },
    spaces: {
      keySet: !!spacesKey,
      keyPreview: spacesKey ? `${spacesKey.substring(0, 6)}...` : '(not set)',
      secretSet: !!spacesSecret,
      bucketSet: !!spacesBucket,
      bucket: spacesBucket || '(not set)',
      endpointSet: !!spacesEndpoint,
      endpoint: spacesEndpoint || '(not set)',
      publicBaseUrl: process.env.SPACES_PUBLIC_BASE_URL || '(not set)'
    }
  }
})
