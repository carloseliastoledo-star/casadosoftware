<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-2xl font-extrabold tracking-tight text-gray-900">Admin • Product Image</h1>
          <p class="mt-2 text-sm text-gray-600">Upload an image for this product. It will appear on the product page and cards.</p>
        </div>
        <NuxtLink to="/" class="text-sm font-extrabold text-brand-blue hover:underline">← Back to store</NuxtLink>
      </div>

      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <div class="text-sm font-extrabold text-gray-900">Product</div>
          <div class="mt-2 text-lg font-extrabold text-gray-900">{{ product?.title || slug }}</div>
          <div class="mt-1 text-sm text-gray-600">Slug: <span class="font-mono">{{ slug }}</span></div>

          <div class="mt-5">
            <div class="text-sm font-extrabold text-gray-900">Current image</div>
            <div class="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
              <img v-if="currentImage" :src="currentImage" alt="Product image" class="h-40 w-full object-contain" />
              <div v-else class="text-sm text-gray-600">No image uploaded yet.</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-100 bg-white p-6">
          <div class="text-sm font-extrabold text-gray-900">Upload new image</div>
          <p class="mt-2 text-sm text-gray-600">PNG/JPG/WebP/SVG • max 5MB</p>

          <div class="mt-4 grid gap-3">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              @change="onFile"
              class="block w-full text-sm"
            />

            <button
              type="button"
              class="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700 disabled:opacity-60"
              :disabled="!file || uploading"
              @click="upload"
            >
              <span v-if="uploading">Uploading...</span>
              <span v-else>Upload & save image</span>
            </button>

            <div v-if="success" class="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-800">
              Image uploaded successfully.
            </div>

            <div v-if="errorMessage" class="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-800">
              {{ errorMessage }}
            </div>

            <div class="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-600">
              Optional security: set <span class="font-mono">ADMIN_TOKEN</span> in your env and send it as a Bearer token.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/data/catalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug || '').trim())

const { data: productData, refresh: refreshProduct } = await useFetch<Product>(() => `/api/products/${slug.value}`)
const product = computed(() => productData.value)

const uploadedImageUrl = ref('')
const currentImage = computed(() => {
  const live = String(uploadedImageUrl.value || '').trim()
  if (live) return live
  return String((product.value as any)?.imageUrl || '').trim()
})

const file = ref<File | null>(null)
const uploading = ref(false)
const success = ref(false)
const errorMessage = ref('')

function onFile(e: Event) {
  success.value = false
  errorMessage.value = ''
  const input = e.target as HTMLInputElement
  file.value = input.files?.[0] || null
}

async function upload() {
  if (!file.value) return
  uploading.value = true
  success.value = false
  errorMessage.value = ''

  try {
    const form = new FormData()
    form.append('image', file.value)

    const res = await $fetch<{ imageUrl: string }>(`/api/admin/products/${slug.value}/image`, {
      method: 'POST',
      body: form
    })

    if (res?.imageUrl) {
      success.value = true
      uploadedImageUrl.value = res.imageUrl
      await refreshProduct()
    }
  } catch (err: any) {
    const status = err?.statusCode || err?.status || err?.data?.statusCode
    const message = err?.data?.statusMessage || err?.data?.message || err?.message
    errorMessage.value = [status, message].filter(Boolean).join(' • ') || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

useSeoMeta(() => ({
  title: `Admin • ${slug.value}`,
  description: 'Upload and manage product images.'
}))
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.text-brand-blue { color: #1D4ED8; }
</style>
