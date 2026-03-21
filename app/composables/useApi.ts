import type { UseFetchOptions } from 'nuxt/app'

/**
 * Composable wrapper around useFetch that prefixes the external API_URL.
 * Use this for reactive SSR-compatible data fetching (replaces useFetch('/api/...')).
 */
export function useApi<T = any>(url: string | (() => string), options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig()
  const apiUrl = config.public.API_URL as string

  const resolvedUrl = typeof url === 'function' ? url : () => url

  return useFetch<T>(() => `${apiUrl}${resolvedUrl()}`, {
    ...options,
    server: true,
    lazy: false,
    default: options.default ?? (() => null as any),
  })
}

/**
 * Non-reactive fetch helper that prefixes the external API_URL.
 * Use this for event-driven calls (replaces $fetch('/api/...')).
 */
export function $api<T = any>(url: string, options: any = {}): Promise<T> {
  const config = useRuntimeConfig()
  const apiUrl = config.public.API_URL as string

  return $fetch<T>(`${apiUrl}${url}`, options)
}
