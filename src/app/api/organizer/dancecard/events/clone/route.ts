import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  assertOrganizerCanMutate,
  getAuthedUserId,
  organizerDevBypassEnabled,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { organizerCloneEventSchema } from '@/lib/dancecard/organizerSchemas'
import { cloneDancecardEvent } from '@/lib/dancecard/cloneEvent'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const bypass = organizerDevBypassEnabled()
    const userId = bypass ? null : await getAuthedUserId()
    if (!userId && !bypass) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const ownerId = userId ?? '00000000-0000-4000-8000-000000000001'

    const body = organizerCloneEventSchema.parse(await request.json())
    const sourceCtx = await requireOrganizerForSlug(body.sourceSlug)
    assertOrganizerCanMutate(sourceCtx)

    const sourceEvent = await loadEventBySlugAnyStatus(sourceCtx.admin, body.sourceSlug)
    if (!sourceEvent || sourceEvent.id !== sourceCtx.eventId) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const admin = sourceCtx.admin
    const newSlug = body.newSlug.trim().toLowerCase()
    const { data: clash } = await admin.from('dancecard_events').select('id').eq('slug', newSlug).maybeSingle()
    if (clash) {
      return NextResponse.json({ error: 'New slug already in use' }, { status: 409 })
    }

    const anchorA = new Date(body.anchorSourceStartsAt).getTime()
    const anchorB = new Date(body.anchorTargetStartsAt).getTime()
    if (Number.isNaN(anchorA) || Number.isNaN(anchorB)) {
      return NextResponse.json({ error: 'Invalid anchor dates' }, { status: 400 })
    }
    const shiftMs = anchorB - anchorA

    const { newEventId } = await cloneDancecardEvent(admin, {
      sourceEventId: sourceCtx.eventId,
      newSlug,
      newEventTitle: body.newEventTitle,
      productTitle: body.productTitle,
      shiftMs,
      domains: body.domains,
      newOwnerUserId: ownerId,
      actorUserId: ownerId,
    })

    return NextResponse.json({ slug: newSlug, eventId: newEventId })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    if (e instanceof Error && e.message.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: e.message.replace(/^BAD_REQUEST:\s*/, '') }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
