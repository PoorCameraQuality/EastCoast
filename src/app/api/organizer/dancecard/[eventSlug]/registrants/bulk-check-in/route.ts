import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { applyRegistrantCheckIn } from '@/lib/dancecard/applyRegistrantCheckIn'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  registrantIds: z.array(z.string().uuid()).min(1).max(200),
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
    const results: Array<{
      registrantId: string
      ok: boolean
      registrant?: ReturnType<typeof applyRegistrantCheckIn> extends Promise<infer R>
        ? R extends { ok: true; registrant: infer T }
          ? T
          : never
        : never
      error?: { code: string; message: string; validFrom?: string | null }
    }> = []

    for (const registrantId of body.registrantIds) {
      const result = await applyRegistrantCheckIn({
        admin,
        eventId,
        registrantId,
        event,
        earlyCheckInOverride: Boolean(body.earlyCheckInOverride),
        organizerRole,
      })
      if (result.ok) {
        results.push({ registrantId, ok: true, registrant: result.registrant })
      } else if (result.code === 'EARLY_CHECK_IN') {
        results.push({
          registrantId,
          ok: false,
          error: {
            code: 'EARLY_CHECK_IN',
            message: 'Early check-in',
            validFrom: result.validFrom,
          },
        })
      } else {
        results.push({ registrantId, ok: false, error: { code: 'NOT_FOUND', message: 'Not found' } })
      }
    }

    return NextResponse.json({ results })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
