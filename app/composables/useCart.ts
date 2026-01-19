import { ref, watch } from 'vue'

export const useCart = () => {
  const cart = ref<any[]>([])

  // carregar do localStorage (client only)
  if (import.meta.client) {
    const saved = localStorage.getItem('cart')
    if (saved) cart.value = JSON.parse(saved)
  }

  watch(cart, () => {
    if (import.meta.client) {
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }, { deep: true })

  const addToCart = (product: any) => {
    cart.value = [product] // MVP: 1 produto por vez
  }

  const clearCart = () => {
    cart.value = []
    if (import.meta.client) {
      localStorage.removeItem('cart')
    }
  }

  return {
    cart,
    addToCart,
    clearCart
  }
}
