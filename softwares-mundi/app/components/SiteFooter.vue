<template>
  <footer class="mt-16 border-t border-gray-100 bg-white">
    <div class="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
      <div class="grid gap-10 py-12 md:grid-cols-3">
        <div>
          <div class="flex items-center gap-2 font-extrabold">
            <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue text-white">SM</span>
            <span>Softwares Mundi</span>
          </div>
          <p class="mt-3 text-sm text-gray-600">
            Genuine software licenses with instant email delivery and secure checkout.
          </p>
          <div class="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <span class="inline-flex h-2 w-2 rounded-full bg-brand-green" />
            <span>Instant Delivery</span>
          </div>
        </div>

        <div class="text-sm">
          <div class="font-bold text-gray-900">Company</div>
          <div class="mt-3 grid gap-2 text-gray-600">
            <NuxtLink to="/about" class="hover:text-brand-blue">About</NuxtLink>
            <NuxtLink to="/contact" class="hover:text-brand-blue">Contact</NuxtLink>
            <NuxtLink to="/faq" class="hover:text-brand-blue">FAQ</NuxtLink>
          </div>
        </div>

        <div class="text-sm">
          <div class="font-bold text-gray-900">Legal</div>
          <div class="mt-3 grid gap-2 text-gray-600">
            <NuxtLink to="/refund-policy" class="hover:text-brand-blue">Refund Policy</NuxtLink>
            <NuxtLink to="/terms" class="hover:text-brand-blue">Terms of Service</NuxtLink>
          </div>
        </div>
      </div>

      <div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 py-6 text-xs text-gray-500 md:flex-row">
        <div>© {{ new Date().getFullYear() }} Softwares Mundi. All rights reserved.</div>
        <div class="flex items-center gap-2">
          <span class="inline-flex h-2 w-2 rounded-full bg-brand-blue" />
          <span>Secure Payment</span>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.bg-brand-blue { background-color: #1D4ED8; }
.bg-brand-green { background-color: #16A34A; }
</style>
