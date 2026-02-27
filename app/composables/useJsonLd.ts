export function useJsonLd(getSchema: () => any, key = 'jsonld') {
  useHead(() => {
    const schema = getSchema?.()
    if (!schema) return {}

    return {
      script: [
        {
          key,
          type: 'application/ld+json',
          children: JSON.stringify(schema)
        }
      ]
    }
  })
}
