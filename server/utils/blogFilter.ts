/**
 * Retorna o filtro Prisma para posts visíveis publicamente:
 * - status = 'published'
 * - OU status = 'scheduled' com scheduledAt <= agora
 * Também aceita posts legados com publicado=true e status='draft' (backfill gradual).
 */
export function publicBlogFilter(extra: Record<string, any> = {}) {
  const now = new Date()
  return {
    ...extra,
    OR: [
      { status: 'published' },
      { status: 'scheduled', scheduledAt: { lte: now } },
      { publicado: true, status: 'draft' }
    ]
  }
}
