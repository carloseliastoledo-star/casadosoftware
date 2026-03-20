<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Contact</h1>
      <p class="mt-3 text-sm text-gray-700">Questions before you buy? Send us a message.</p>

      <form class="mt-6 grid gap-4 max-w-xl" @submit.prevent="submit">
        <div>
          <label class="text-sm font-bold text-gray-700">Name</label>
          <input v-model="name" class="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-bold text-gray-700">Email</label>
          <input v-model="email" type="email" class="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
        </div>
        <div>
          <label class="text-sm font-bold text-gray-700">Message</label>
          <textarea v-model="message" rows="5" class="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm" />
        </div>

        <button type="submit" class="rounded-2xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white hover:bg-blue-700">
          Send Message
        </button>

        <div v-if="sent" class="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-green-700">
          Message sent (mock). We'll reply soon.
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contact',
  description: 'Contact Softwares Mundi for questions about delivery, activation and purchasing.'
})

const name = ref('')
const email = ref('')
const message = ref('')
const sent = ref(false)

function submit() {
  sent.value = true
}
</script>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
</style>
