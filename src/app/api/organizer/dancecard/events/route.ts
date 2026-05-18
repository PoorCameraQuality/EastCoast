import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  assertProductionNoOrganizerBypass,
  getAuthedUserId,
  listOrganizerHubEvents,
  organizerDevBypassEnabled,
  organizerErrorResponse,
} from '@/lib/dancecard/organizerAuth'
import { organizerCreateEventSchema } from '@/lib/dancecard/organizerSchemas'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'
import { getDancecardAdmin, normalizeEventSlug } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    assertProductionNoOrganizerBypass()
    const userId = organizerDevBypassEnabled() ? null : await getAuthedUserId()
    if (!organizerDevBypassEnabled() && !userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const events = await listOrganizerHubEvents(userId)
    return NextResponse.json({ events })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest) {
  try {
    assertProductionNoOrganizerBypass()
    const admin = getDancecardAdmin()
    const bypass = organizerDevBypassEnabled()
    const userId = bypass ? null : await getAuthedUserId()
    if (!userId && !bypass) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const ownerId = userId ?? '00000000-0000-4000-8000-000000000001'

    const body = organizerCreateEventSchema.parse(await request.json())
    const slug = normalizeEventSlug(body.slug)
    const { data: clash } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
    if (clash) {
      return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
    }

    const ws = new Date(body.windowStartsAt).toISOString()
    const we = new Date(body.windowEndsAt).toISOString()
    if (new Date(ws).getTime() >= new Date(we).getTime()) {
      return NextResponse.json({ error: 'windowStartsAt must be before windowEndsAt' }, { status: 400 })
    }

    const { data: ev, error } = await admin
      .from('dancecard_events')
      .insert({
        slug,
        product_title: body.productTitle,
        event_title: body.eventTitle,
        timezone: body.timezone,
        window_starts_at: ws,
        window_ends_at: we,
        shared_by_label: body.sharedByLabel ?? body.eventTitle,
        shared_by_detail: body.sharedByDetail ?? null,
        status: 'draft',
        staff_access_code: null,
        registration_access_code: null,
        badge_layout_json: {},
      })
      .select('id')
      .single()
    if (error || !ev) throw error ?? new Error('insert failed')

    const eventId = (ev as { id: string }).id
    const { error: oErr } = await admin.from('dancecard_event_organizers').insert({
      event_id: eventId,
      user_id: ownerId,
      role: 'owner',
    })
    if (oErr) {
      await admin.from('dancecard_events').delete().eq('id', eventId)
      throw oErr
    }

    await insertDancecardAuditLog(admin, {
      actorUserId: userId,
      eventId,
      action: 'event.create',
      metadata: { slug },
    })

    return NextResponse.json({ slug, eventId })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
