export function useJsonLd(getSchema: () => any, key = 'jsonld') {
  useHead(() => {
    const schema = getSchema?.()
    if (!schema) return {}

    const json = JSON.stringify(schema)

    return {
      __dangerouslyDisableSanitizersByTagID: {
        [key]: ['innerHTML']
      },
      script: [
        {
          key,
          type: 'application/ld+json',
          innerHTML: json
        }
      ]
    }
  })
}
