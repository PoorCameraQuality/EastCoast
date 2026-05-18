import { NextResponse } from 'next/server'
import { publishMessageCampaign } from '@/lib/dancecard/publishMessageCampaign'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function POST(_request: Request, context: { params: { eventSlug: string; campaignId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const campaignId = context.params.campaignId

    const result = await publishMessageCampaign(admin, eventId, campaignId)

    const status =
      result.emailsSkipped || result.emailsSent > 0
        ? 'sent'
        : result.emailsFailed > 0
          ? 'failed'
          : 'sent'

    return NextResponse.json({
      ok: true,
      status,
      feedPublished: result.feedPublished,
      sentAt: result.sentAt,
      recipientCount: result.recipientCount,
      sent: result.emailsSent,
      failed: result.emailsFailed,
      emailsSkipped: result.emailsSkipped,
      emailSkipReason: result.skipReason ?? null,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    if (msg === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (msg === 'ALREADY_SENT') {
      return NextResponse.json({ error: 'Campaign already published' }, { status: 400 })
    }
    if (msg === 'DELIVERIES_EXIST') {
      return NextResponse.json(
        { error: 'Deliveries already exist for this campaign. Create a new campaign to publish again.' },
        { status: 400 },
      )
    }
    if (msg === 'TEMPLATE_MISSING') {
      return NextResponse.json({ error: 'Template missing' }, { status: 400 })
    }
    if (msg === 'RESEND_NOT_CONFIGURED') {
      return NextResponse.json(
        {
          error:
            'Email is not configured. Set RESEND_API_KEY and DANCECARD_RESEND_FROM in the server environment (see docs/dancecard-first-run.md).',
        },
        { status: 503 },
      )
    }
    return organizerErrorResponse(e)
  }
}
