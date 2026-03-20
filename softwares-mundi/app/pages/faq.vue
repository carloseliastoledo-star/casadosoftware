<template>
  <div class="py-10">
    <div class="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <h1 class="text-3xl font-extrabold tracking-tight text-gray-900">Frequently Asked Questions</h1>
      <p class="mt-3 text-sm text-gray-700">Quick answers about delivery, activation and refunds.</p>
    </div>

    <div class="mt-8">
      <FaqAccordion :items="items" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FaqAccordion from '~/components/FaqAccordion.vue'

useSeoMeta({
  title: 'FAQ',
  description: 'Frequently asked questions about software license delivery, activation, and secure payments.'
})

const items = [
  {
    q: 'How do I receive my license?',
    a: 'After payment confirmation, your license and instructions are delivered by email.'
  },
  {
    q: 'Is payment secure?',
    a: 'Yes. We use Stripe Checkout to process payments securely.'
  },
  {
    q: 'Do you offer refunds?',
    a: 'Please see our Refund Policy page for details about eligibility.'
  },
  {
    q: 'Do you use any prohibited terms?',
    a: 'No. We focus on genuine licenses and professional language.'
  }
]
</script>
