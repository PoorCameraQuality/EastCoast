import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { applyRegistrantCheckIn } from '@/lib/dancecard/applyRegistrantCheckIn'
import { verifyCheckInQrPayload } from '@/lib/dancecard/checkInToken'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  registrantId: z.string().uuid().optional(),
  qr: z.string().min(8).optional(),
  earlyCheckInOverride: z.boolean().optional(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = bodySchema.parse(await request.json())
    let registrantId = body.registrantId
    if (body.qr) {
      const parsed = verifyCheckInQrPayload(body.qr)
      if (!parsed) return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
      const { data: row } = await admin
        .from('dancecard_registrants')
        .select('id, check_in_token')
        .eq('id', parsed.registrantId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (!row || (row.check_in_token as string | null) !== parsed.token) {
        return NextResponse.json({ error: 'Registrant not found' }, { status: 404 })
      }
      registrantId = parsed.registrantId
    }
    if (!registrantId) {
      return NextResponse.json({ error: 'registrantId or qr required' }, { status: 400 })
    }

    const result = await applyRegistrantCheckIn({
      admin,
      eventId,
      registrantId,
      event,
      earlyCheckInOverride: Boolean(body.earlyCheckInOverride),
      organizerRole,
    })

    if (!result.ok) {
      if (result.code === 'NOT_FOUND') return NextResponse.json({ error: 'Not found' }, { status: 404 })
      if (result.code === 'EARLY_CHECK_IN') {
        return NextResponse.json(
          {
            error: 'This attendee is early for their ticket check-in window.',
            code: 'EARLY_CHECK_IN',
            eligibility: result.eligibility,
            validFrom: result.validFrom,
          },
          { status: 409 },
        )
      }
    }

    if (!result.ok) {
      return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
    }
    return NextResponse.json({ registrant: result.registrant })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
