import { ref, watch, computed } from 'vue'
import { trackAddToCart } from '~/services/analytics'

export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  image: string
  quantity: number
}

export const useCart = () => {
  const cart = ref<CartItem[]>([])

  // carregar do localStorage (client only)
  if (import.meta.client) {
    const saved = localStorage.getItem('cart')
    if (saved) {
      try {
        cart.value = JSON.parse(saved)
      } catch {
        cart.value = []
      }
    }
  }

  watch(cart, () => {
    if (import.meta.client) {
      localStorage.setItem('cart', JSON.stringify(cart.value))
    }
  }, { deep: true })

  const addToCart = (product: Partial<CartItem>) => {
    try {
      trackAddToCart(product)
    } catch {
      // ignore
    }

    const existingIndex = cart.value.findIndex(item => item.id === product.id)
    
    if (existingIndex >= 0) {
      // Se já existe, aumenta a quantidade
      cart.value[existingIndex].quantity += 1
    } else {
      // Se não existe, adiciona novo item
      cart.value.push({
        id: product.id || '',
        name: product.name || '',
        slug: product.slug || '',
        price: product.price || 0,
        image: product.image || '',
        quantity: 1
      })
    }
  }

  const removeFromCart = (id: string) => {
    cart.value = cart.value.filter(item => item.id !== id)
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = cart.value.find(item => item.id === id)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(id)
      } else {
        item.quantity = quantity
      }
    }
  }

  const increaseQuantity = (id: string) => {
    const item = cart.value.find(item => item.id === id)
    if (item) {
      item.quantity += 1
    }
  }

  const decreaseQuantity = (id: string) => {
    const item = cart.value.find(item => item.id === id)
    if (item) {
      if (item.quantity > 1) {
        item.quantity -= 1
      } else {
        removeFromCart(id)
      }
    }
  }

  const clearCart = () => {
    cart.value = []
    if (import.meta.client) {
      localStorage.removeItem('cart')
    }
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  })

  const cartItemCount = computed(() => {
    return cart.value.reduce((count, item) => count + item.quantity, 0)
  })

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    cartTotal,
    cartItemCount
  }
}
