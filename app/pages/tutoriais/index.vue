<script setup>
import { products } from '~/data/products'
</script>

<template>
  <section class="py-20">
    <div class="max-w-5xl mx-auto px-6">
      <h1 class="text-3xl font-bold mb-10">
        Tutoriais de Ativação
      </h1>

      <ul class="space-y-4">
        <li
          v-for="p in products"
          :key="p.slug"
          class="bg-white border rounded-lg p-6 hover:shadow"
        >
          <NuxtLink
            :to="`/tutoriais/${p.slug}`"
            class="text-blue-600 font-semibold hover:underline"
          >
            Como ativar {{ p.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>
