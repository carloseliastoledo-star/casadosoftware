import { defineNitroPlugin } from 'nitropack/runtime'

export default defineNitroPlugin((nitroApp: any) => {
  try {
    console.log('[nitro][plugin]', 'error-logger loaded')
  } catch {
    // ignore
  }

  try {
    process.on('unhandledRejection', (reason: any) => {
      try {
        const payload = {
          type: 'unhandledRejection',
          reason: reason instanceof Error
            ? { name: reason.name, message: reason.message, stack: reason.stack }
            : reason
        }
        console.error('[nitro][process]', JSON.stringify(payload))
        console.log('[nitro][process]', JSON.stringify(payload))
      } catch {
        console.error('[nitro][process]', 'unhandledRejection')
      }
    })

    process.on('uncaughtException', (err: any) => {
      try {
        const payload = {
          type: 'uncaughtException',
          error: err instanceof Error
            ? { name: err.name, message: err.message, stack: err.stack }
            : err
        }
        console.error('[nitro][process]', JSON.stringify(payload))
        console.log('[nitro][process]', JSON.stringify(payload))
      } catch {
        console.error('[nitro][process]', 'uncaughtException')
      }
    })
  } catch {
    // ignore
  }

  nitroApp.hooks.hook('afterResponse', (event: any) => {
    try {
      const statusCode = Number(event?.node?.res?.statusCode || 0)
      if (!statusCode || statusCode < 500) return

      const method = event?.node?.req?.method
      const url = event?.node?.req?.url
      const statusMessage = event?.node?.res?.statusMessage

      const payload = {
        method,
        url,
        statusCode,
        statusMessage,
        userAgent: event?.node?.req?.headers?.['user-agent']
      }
      console.error('[nitro][5xx]', JSON.stringify(payload))
      console.log('[nitro][5xx]', JSON.stringify(payload))
    } catch {
      // ignore
    }
  })

  nitroApp.hooks.hook('error', (error: any, { event }: { event?: any }) => {
    try {
      const url = event?.node?.req?.url
      const method = event?.node?.req?.method
      const statusCode = Number((error as any)?.statusCode || 0)
      if (statusCode && statusCode < 500) return

      const payload = {
        method,
        url,
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      }
      console.error('[nitro][error]', JSON.stringify(payload))
      console.log('[nitro][error]', JSON.stringify(payload))
    } catch {
      const statusCode = Number((error as any)?.statusCode || 0)
      if (statusCode && statusCode < 500) return
      const payload = {
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      }
      console.error('[nitro][error]', JSON.stringify(payload))
      console.log('[nitro][error]', JSON.stringify(payload))
    }
  })
})
