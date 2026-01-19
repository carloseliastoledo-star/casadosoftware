<script setup>
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const id = route.params.id
</script>

<template>
  <h1 class="text-2xl font-bold">
    Editando produto {{ id }}
  </h1>
</template>
