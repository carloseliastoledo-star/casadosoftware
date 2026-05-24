import { defineEventHandler, getQuery } from 'h3'
import prisma from '../../db/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { status, paymentStatus, customerEmail, licenseEmail, dateFrom, dateTo } = query

  const where: any = {}

  if (status) {
    where.status = status
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus
  }

  if (customerEmail) {
    where.customerEmail = {
      contains: customerEmail as string
    }
  }

  if (licenseEmail) {
    where.licenseEmail = {
      contains: licenseEmail as string
    }
  }

  if (dateFrom || dateTo) {
    where.sentAt = {}
    if (dateFrom) {
      where.sentAt.gte = new Date(dateFrom as string)
    }
    if (dateTo) {
      where.sentAt.lte = new Date(dateTo as string)
    }
  }

  try {
    const licenseSends = await prisma.office365TestLicenseSend.findMany({
      where,
      orderBy: {
        sentAt: 'desc'
      },
      take: 100
    })

    return {
      licenseSends
    }
  } catch (error: any) {
    console.error('[api/admin/testes-office-365] error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao buscar licenças enviadas'
    })
  }
})
