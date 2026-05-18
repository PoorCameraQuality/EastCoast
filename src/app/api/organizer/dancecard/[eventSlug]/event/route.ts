import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, assertOrganizerOwnerOrAdmin, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPatchEventSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'
import { organizerEventDtoFromRow } from '@/lib/dancecard/organizerEventDto'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({
      organizerRole,
      event: organizerEventDtoFromRow(event as Record<string, unknown>),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = organizerPatchEventSchema.parse(await request.json())
    if (
      body.status !== undefined ||
      body.staffAccessCode !== undefined ||
      body.registrationAccessCode !== undefined
    ) {
      assertOrganizerOwnerOrAdmin(ctx)
    }
    const patch: Record<string, unknown> = {}
    if (body.productTitle !== undefined) patch.product_title = body.productTitle
    if (body.eventTitle !== undefined) patch.event_title = body.eventTitle
    if (body.subtitle !== undefined) patch.subtitle = body.subtitle
    if (body.timezone !== undefined) patch.timezone = body.timezone
    if (body.windowStartsAt !== undefined) patch.window_starts_at = new Date(body.windowStartsAt).toISOString()
    if (body.windowEndsAt !== undefined) patch.window_ends_at = new Date(body.windowEndsAt).toISOString()
    if (body.sharedByLabel !== undefined) patch.shared_by_label = body.sharedByLabel
    if (body.sharedByDetail !== undefined) patch.shared_by_detail = body.sharedByDetail
    if (body.logoUrl !== undefined) {
      patch.logo_url = body.logoUrl === '' ? null : body.logoUrl
    }
    if (body.status !== undefined) patch.status = body.status
    if (body.staffAccessCode !== undefined) {
      patch.staff_access_code =
        body.staffAccessCode === '' || body.staffAccessCode === null ? null : body.staffAccessCode
    }
    if (body.registrationAccessCode !== undefined) {
      patch.registration_access_code =
        body.registrationAccessCode === '' || body.registrationAccessCode === null
          ? null
          : body.registrationAccessCode
    }
    if (body.badgeLayoutJson !== undefined) {
      patch.badge_layout_json = body.badgeLayoutJson
    }
    if (body.themeConfig !== undefined) {
      patch.theme_config = body.themeConfig
    }
    if (body.eventProfile !== undefined) {
      patch.event_profile = body.eventProfile
    }
    if (body.attendeeGuideJson !== undefined) {
      patch.attendee_guide_json = body.attendeeGuideJson
    }
    if (body.agreementsConfig !== undefined) {
      patch.agreements_config = body.agreementsConfig
    }
    if (body.attendeeProfileConfig !== undefined) {
      patch.attendee_profile_config = body.attendeeProfileConfig
    }

    if (body.windowStartsAt !== undefined && body.windowEndsAt !== undefined) {
      const a = new Date(body.windowStartsAt).getTime()
      const b = new Date(body.windowEndsAt).getTime()
      if (a >= b) {
        return NextResponse.json({ error: 'windowStartsAt must be before windowEndsAt' }, { status: 400 })
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    patch.updated_at = new Date().toISOString()

    const { data, error } = await admin
      .from('dancecard_events')
      .update(patch)
      .eq('id', eventId)
      .select('*')
      .single()
    if (error) throw error

    return NextResponse.json({
      organizerRole,
      event: organizerEventDtoFromRow(data as Record<string, unknown>),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
