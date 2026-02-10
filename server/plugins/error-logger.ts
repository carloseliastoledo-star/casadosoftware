import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp: any) => {
  nitroApp.hooks.hook('error', (error: any, { event }: { event?: any }) => {
    try {
      const url = event?.node?.req?.url
      const statusCode = Number((error as any)?.statusCode || 0)
      if (statusCode && statusCode < 500) return
      console.error('[nitro][error]', {
        url,
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      })
    } catch {
      const statusCode = Number((error as any)?.statusCode || 0)
      if (statusCode && statusCode < 500) return
      console.error('[nitro][error]', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      })
    }
  })
})
