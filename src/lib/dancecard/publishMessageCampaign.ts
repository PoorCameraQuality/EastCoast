import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendViaResend } from '@/lib/dancecard/resendOutbound'

function idempotencyKey(campaignId: string, email: string) {
  return createHash('sha256').update(`${campaignId}:${email.toLowerCase()}`, 'utf8').digest('hex')
}

function resendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.DANCECARD_RESEND_FROM?.trim())
}

export type PublishCampaignResult = {
  ok: true
  feedPublished: boolean
  sentAt: string
  emailConfigured: boolean
  recipientCount: number
  emailsSent: number
  emailsFailed: number
  emailsSkipped: boolean
  skipReason?: string
}

/** Publishes announcement to the attendee dancecard feed; emails are optional. */
export async function publishMessageCampaign(
  admin: SupabaseClient,
  eventId: string,
  campaignId: string,
): Promise<PublishCampaignResult> {
  const { data: campaign, error: cErr } = await admin
    .from('dancecard_message_campaigns')
    .select('id, event_id, template_id, status')
    .eq('id', campaignId)
    .eq('event_id', eventId)
    .maybeSingle()
  if (cErr) throw cErr
  if (!campaign) throw new Error('NOT_FOUND')
  if (campaign.status === 'sent') throw new Error('ALREADY_SENT')

  const { count: prior } = await admin
    .from('dancecard_message_deliveries')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
  if (typeof prior === 'number' && prior > 0) {
    throw new Error('DELIVERIES_EXIST')
  }

  const { data: template, error: tErr } = await admin
    .from('dancecard_message_templates')
    .select('subject, body_text')
    .eq('id', campaign.template_id as string)
    .eq('event_id', eventId)
    .maybeSingle()
  if (tErr) throw tErr
  if (!template) throw new Error('TEMPLATE_MISSING')

  const now = new Date().toISOString()

  await admin
    .from('dancecard_message_campaigns')
    .update({ status: 'sending' })
    .eq('id', campaignId)
    .eq('event_id', eventId)

  await admin
    .from('dancecard_message_campaigns')
    .update({ status: 'sent', sent_at: now })
    .eq('id', campaignId)
    .eq('event_id', eventId)

  const emailConfigured = resendConfigured()
  let emailsSent = 0
  let emailsFailed = 0
  let emailsSkipped = false
  let skipReason: string | undefined
  let recipientCount = 0

  if (!emailConfigured) {
    emailsSkipped = true
    skipReason = 'Email is not configured (RESEND_API_KEY / DANCECARD_RESEND_FROM).'
  } else {
    const { data: registrants, error: rErr } = await admin
      .from('dancecard_registrants')
      .select('email, status')
      .eq('event_id', eventId)
    if (rErr) throw rErr

    const emails = Array.from(
      new Set(
        (registrants ?? [])
          .filter((r) => r.status !== 'cancelled')
          .map((r) => String(r.email ?? '').trim().toLowerCase())
          .filter((e) => e.includes('@')),
      ),
    )
    recipientCount = emails.length

    if (!emails.length) {
      emailsSkipped = true
      skipReason = 'No registrant emails on file for this event.'
    } else {
      for (const to of emails) {
        const key = idempotencyKey(campaignId, to)
        const { error: insErr } = await admin.from('dancecard_message_deliveries').insert({
          campaign_id: campaignId,
          to_address: to,
          idempotency_key: key,
          status: 'queued',
        })
        if (insErr) {
          emailsFailed++
          continue
        }
        try {
          const out = await sendViaResend({
            to,
            subject: String(template.subject),
            text: String(template.body_text),
          })
          await admin
            .from('dancecard_message_deliveries')
            .update({
              status: 'sent',
              provider_message_id: out.id || null,
              sent_at: now,
              error: null,
            })
            .eq('campaign_id', campaignId)
            .eq('idempotency_key', key)
          emailsSent++
        } catch (e) {
          const msg = e instanceof Error ? e.message : 'send failed'
          await admin
            .from('dancecard_message_deliveries')
            .update({ status: 'failed', error: msg.slice(0, 2000) })
            .eq('campaign_id', campaignId)
            .eq('idempotency_key', key)
          emailsFailed++
        }
      }
    }
  }

  return {
    ok: true,
    feedPublished: true,
    sentAt: now,
    emailConfigured,
    recipientCount,
    emailsSent,
    emailsFailed,
    emailsSkipped,
    skipReason,
  }
}
