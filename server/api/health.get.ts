export default defineEventHandler(() => {
  return {
    ok: true,
    status: 'online',
    timestamp: new Date().toISOString()
  }
})
