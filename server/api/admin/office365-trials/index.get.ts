import prisma from '#root/server/db/prisma'

export default defineEventHandler(async (event) => {
  try {
    const leads = await prisma.$queryRawUnsafe(`
      SELECT * FROM Office365TrialLead 
      ORDER BY createdAt DESC
    `)

    return {
      leads
    }
  } catch (error) {
    console.error('[api/admin/office365-trials] error:', error)
    return {
      leads: []
    }
  }
})
