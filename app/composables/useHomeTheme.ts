import type { HomeTheme } from '~/types/homeTheme'

export function useHomeTheme() {
  const { data } = useFetch<{ ok: boolean; theme: HomeTheme | null }>('/api/home-theme', {
    server: true,
    default: () => ({ ok: true, theme: null })
  })

  const homeTheme = computed<HomeTheme | null>(() => data.value?.theme ?? null)

  return { homeTheme }
}
