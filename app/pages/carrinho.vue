<script setup lang="ts">
import { useCart } from '~/composables/useCart'
import type { CartItem } from '~/composables/useCart'

const { cart, removeFromCart, increaseQuantity, decreaseQuantity, cartTotal, cartItemCount, clearCart } = useCart()

useSeoMeta({
  title: 'Carrinho de Compras | Casa do Software',
  description: 'Finalize sua compra de softwares originais com entrega imediata.'
})

function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',')
}

function handleCheckout() {
  navigateTo('/checkout')
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f7] font-sans">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Carrinho de Compras</h1>
        <p class="text-gray-600 text-sm mt-1">
          {{ cartItemCount }} {{ cartItemCount === 1 ? 'item' : 'itens' }} no carrinho
        </p>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="cart.length === 0" class="text-center py-16">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Seu carrinho está vazio</h2>
        <p class="text-gray-600 mb-6">Adicione produtos para continuar sua compra</p>
        <a href="/" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition">
          Continuar comprando
        </a>
      </div>

      <div v-else class="grid lg:grid-cols-3 gap-8">
        <!-- Lista de produtos -->
        <div class="lg:col-span-2 space-y-4">
          <div
            v-for="item in cart"
            :key="item.id"
            class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
          >
            <div class="flex gap-4">
              <!-- Imagem -->
              <div class="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <img
                  v-if="item.image"
                  :src="item.image"
                  :alt="item.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-3xl">
                  💻
                </div>
              </div>

              <!-- Detalhes -->
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 text-sm">{{ item.name }}</h3>
                <p class="text-xs text-gray-500 mt-1">Licença digital • Entrega imediata</p>
                <p class="text-lg font-bold text-green-700 mt-2">R$ {{ formatPrice(item.price) }}</p>
              </div>

              <!-- Quantidade e remover -->
              <div class="flex flex-col items-end gap-2">
                <button
                  @click="removeFromCart(item.id)"
                  class="text-red-500 hover:text-red-700 text-sm font-medium transition"
                >
                  Remover
                </button>
                <div class="flex items-center gap-2">
                  <button
                    @click="decreaseQuantity(item.id)"
                    class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <span class="w-8 text-center font-semibold text-gray-900">{{ item.quantity }}</span>
                  <button
                    @click="increaseQuantity(item.id)"
                    class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Subtotal -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <span class="text-sm text-gray-500">Subtotal</span>
              <span class="text-lg font-bold text-gray-900">R$ {{ formatPrice(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>

        <!-- Resumo do pedido -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:sticky lg:top-4">
            <h2 class="font-bold text-gray-800 mb-4 text-xs uppercase tracking-widest">Resumo do pedido</h2>

            <div class="space-y-3 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold text-gray-900">R$ {{ formatPrice(cartTotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Entrega</span>
                <span class="font-semibold text-green-600">Grátis</span>
              </div>
            </div>

            <div class="flex justify-between items-center pt-4 border-t border-gray-100 mb-6">
              <span class="text-sm font-black text-gray-900">Total</span>
              <span class="text-3xl font-black text-green-600">
                R$ {{ formatPrice(cartTotal) }}
              </span>
            </div>

            <button
              @click="handleCheckout"
              class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition mb-3"
            >
              Finalizar compra
            </button>

            <a
              href="/"
              class="block w-full text-center text-gray-600 hover:text-blue-600 font-medium py-2 transition"
            >
              Continuar comprando
            </a>

            <button
              @click="clearCart"
              class="block w-full text-center text-red-500 hover:text-red-700 text-sm font-medium py-2 transition mt-2"
            >
              Limpar carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
