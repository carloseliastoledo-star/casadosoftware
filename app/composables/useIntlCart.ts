/**
 * useIntlCart - Carrinho isolado para loja internacional
 * Usa chave localStorage 'intl-cart' - sem interferência com carrinho nacional
 */

export interface IntlCartItem {
  produtoId: string
  slug: string
  name: string
  image: string | null
  quantity: number
  currency: 'usd' | 'eur'
  price: number
}

const INTL_CART_KEY = 'intl-cart'

function readCart(): IntlCartItem[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(INTL_CART_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeCart(items: IntlCartItem[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(INTL_CART_KEY, JSON.stringify(items))
  } catch {}
}

export function useIntlCart() {
  const items = ref<IntlCartItem[]>([])

  function load() {
    items.value = readCart()
  }

  function addItem(item: Omit<IntlCartItem, 'quantity'> & { quantity?: number }) {
    load()
    const existing = items.value.find((i) => i.produtoId === item.produtoId && i.currency === item.currency)
    if (existing) {
      existing.quantity += item.quantity ?? 1
    } else {
      items.value.push({ ...item, quantity: item.quantity ?? 1 })
    }
    writeCart(items.value)
  }

  function removeItem(produtoId: string) {
    load()
    items.value = items.value.filter((i) => i.produtoId !== produtoId)
    writeCart(items.value)
  }

  function clearCart() {
    items.value = []
    writeCart([])
  }

  function getItem(produtoId: string): IntlCartItem | undefined {
    return items.value.find((i) => i.produtoId === produtoId)
  }

  const total = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  const currency = computed<'usd' | 'eur'>(() =>
    items.value[0]?.currency ?? 'usd'
  )

  const count = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  if (import.meta.client) load()

  return {
    items,
    total,
    currency,
    count,
    load,
    addItem,
    removeItem,
    clearCart,
    getItem,
  }
}
