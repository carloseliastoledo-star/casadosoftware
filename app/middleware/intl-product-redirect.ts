export default defineNuxtRouteMiddleware((to) => {
  const intl = useIntlContext()
  if (intl.currencyLower.value === 'brl') return

  const slug = String(to.params?.slug || '').trim()
  if (!slug) return navigateTo('/', { replace: true })

  return navigateTo(`/product/${slug}`, { redirectCode: 301 })
})
