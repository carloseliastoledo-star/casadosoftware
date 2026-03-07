import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'
import { sendMail } from '../utils/mailer'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(input: string) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const langRaw = String(body?.lang || '').trim().toLowerCase()
  const lang = langRaw === 'en' || langRaw === 'es' || langRaw === 'it' || langRaw === 'fr' ? langRaw : 'pt'

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const website = body?.website != null ? String(body.website).trim() : ''
  const social = body?.social != null ? String(body.social).trim() : ''
  const country = String(body?.country || '').trim()
  const monthlyTraffic = body?.monthlyTraffic != null ? String(body.monthlyTraffic).trim() : ''
  const promotionPlan = body?.promotionPlan != null ? String(body.promotionPlan).trim() : ''

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  if (!isValidEmail(email)) throw createError({ statusCode: 400, statusMessage: 'Email is invalid' })
  if (!country) throw createError({ statusCode: 400, statusMessage: 'Country is required' })

  if (name.length > 120) throw createError({ statusCode: 400, statusMessage: 'Name is too long' })
  if (email.length > 255) throw createError({ statusCode: 400, statusMessage: 'Email is too long' })
  if (website.length > 255) throw createError({ statusCode: 400, statusMessage: 'Website is too long' })
  if (social.length > 255) throw createError({ statusCode: 400, statusMessage: 'Social is too long' })
  if (country.length > 80) throw createError({ statusCode: 400, statusMessage: 'Country is too long' })
  if (monthlyTraffic.length > 120) throw createError({ statusCode: 400, statusMessage: 'Monthly traffic is too long' })
  if (promotionPlan.length > 2000) throw createError({ statusCode: 400, statusMessage: 'Promotion plan is too long' })

  const prismaAny = prisma as any

  try {
    await prismaAny.partnerApplication.create({
      data: {
        name,
        email,
        website: website || null,
        social: social || null,
        country,
        monthlyTraffic: monthlyTraffic || null,
        promotionPlan: promotionPlan || null,
      },
      select: { id: true },
    })
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Could not submit application' })
  }

  const adminTo = String(
    process.env.PARTNER_APPLICATION_TO || process.env.AFFILIATE_APPLICATION_TO || process.env.SMTP_FROM || ''
  ).trim()

  const adminSubject =
    lang === 'en'
      ? 'New partner application'
      : lang === 'es'
        ? 'Nueva solicitud de afiliado'
        : lang === 'it'
          ? 'Nuova richiesta di affiliazione'
          : lang === 'fr'
            ? "Nouvelle demande d'affiliation"
            : 'Nova inscrição de afiliado'

  const userSubject =
    lang === 'en'
      ? 'We received your application'
      : lang === 'es'
        ? 'Hemos recibido tu solicitud'
        : lang === 'it'
          ? 'Abbiamo ricevuto la tua richiesta'
          : lang === 'fr'
            ? 'Nous avons reçu votre demande'
            : 'Recebemos sua inscrição'

  const userTitle =
    lang === 'en'
      ? 'Application received'
      : lang === 'es'
        ? 'Solicitud recibida'
        : lang === 'it'
          ? 'Richiesta ricevuta'
          : lang === 'fr'
            ? 'Demande reçue'
            : 'Inscrição recebida'

  const userBody1 =
    lang === 'en'
      ? 'We received your application. We will review your details and contact you by email.'
      : lang === 'es'
        ? 'Hemos recibido tu solicitud. Revisaremos tus datos y te contactaremos por email.'
        : lang === 'it'
          ? 'Abbiamo ricevuto la tua richiesta. Valuteremo i tuoi dati e ti contatteremo via email.'
          : lang === 'fr'
            ? 'Nous avons reçu votre demande. Nous analyserons vos informations et vous contacterons par e-mail.'
            : 'Recebemos sua inscrição. Vamos analisar e entraremos em contato por e-mail.'

  if (adminTo && adminTo.includes('@')) {
    try {
      await sendMail({
        to: adminTo,
        subject: adminSubject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
            <h2 style="margin: 0 0 12px;">${escapeHtml(adminSubject)}</h2>
            <p style="margin: 0 0 8px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p style="margin: 0 0 8px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin: 0 0 8px;"><strong>Website:</strong> ${escapeHtml(website || '-')}</p>
            <p style="margin: 0 0 8px;"><strong>YouTube / Social:</strong> ${escapeHtml(social || '-')}</p>
            <p style="margin: 0 0 8px;"><strong>Country:</strong> ${escapeHtml(country)}</p>
            <p style="margin: 0 0 8px;"><strong>Monthly traffic:</strong> ${escapeHtml(monthlyTraffic || '-')}</p>
            <p style="margin: 16px 0 8px;"><strong>Promotion plan:</strong></p>
            <div style="white-space: pre-wrap; background: #f3f4f6; padding: 12px; border-radius: 8px;">
              ${escapeHtml(promotionPlan || '-')}
            </div>
          </div>
        `.trim()
      })
    } catch {
      // ignore
    }
  }

  try {
    await sendMail({
      to: email,
      subject: userSubject,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
          <h2 style="margin: 0 0 12px;">${escapeHtml(userTitle)}</h2>
          <p style="margin: 0 0 8px;">${escapeHtml(name)},</p>
          <p style="margin: 0 0 8px;">${escapeHtml(userBody1)}</p>
          <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">Casa do Software</p>
        </div>
      `.trim()
    })
  } catch {
    // ignore
  }

  return { ok: true }
})
