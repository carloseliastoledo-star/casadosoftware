<script setup lang="ts">
definePageMeta({ ssr: true })
const route = useRoute()
const slug = String(route.params.slug || '').trim()
await navigateTo(`/categoria/${slug}`, { replace: true })
</script>
