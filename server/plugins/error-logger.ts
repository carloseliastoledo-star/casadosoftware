export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error, { event }) => {
    try {
      const url = event?.node?.req?.url
      console.error('[nitro][error]', {
        url,
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode: (error as any)?.statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      })
    } catch {
      console.error('[nitro][error]', {
        name: (error as any)?.name,
        message: (error as any)?.message,
        statusCode: (error as any)?.statusCode,
        statusMessage: (error as any)?.statusMessage,
        cause: (error as any)?.cause,
        stack: (error as any)?.stack
      })
    }
  })
})
