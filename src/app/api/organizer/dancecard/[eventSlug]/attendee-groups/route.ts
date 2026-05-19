import { NextRequest, NextResponse } from 'next/server'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { getDancecardAdmin, loadEventBySlugAnyStatus, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { isMissingTable } from '@/lib/dancecard/supabaseColumnFallback'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string } },
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const { eventId } = await requireOrganizerForSlug(slug)
    const admin = getDancecardAdmin()
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('dancecard_attendee_groups')
      .select(
        'id, name, group_type, visibility, status, recruitment_status, curated_pin, created_at, created_by_account_id, dancecard_accounts(display_name, username)',
      )
      .eq('event_id', eventId)
      .order('curated_pin', { ascending: false })
      .order('created_at', { ascending: false })
    if (error) {
      if (isMissingTable(error, 'dancecard_attendee_groups')) {
        return NextResponse.json(
          {
            error: 'Attendee groups tables are missing. Apply migration dancecard_054_attendee_groups.sql.',
            needsMigration: 'dancecard_054_attendee_groups.sql',
          },
          { status: 409 },
        )
      }
      throw error
    }

    const groups = (data ?? []).map((g) => {
      const a = g.dancecard_accounts as
        | { display_name?: string; username?: string }
        | { display_name?: string; username?: string }[]
        | null
      const acc = Array.isArray(a) ? a[0] : a
      return {
        id: g.id,
        name: g.name,
        groupType: g.group_type,
        visibility: g.visibility,
        status: g.status,
        recruitmentStatus: g.recruitment_status,
        curatedPin: g.curated_pin,
        authorSceneName: acc?.display_name ?? '',
        authorUsername: acc?.username ?? '',
      }
    })

    const { data: reports } = await admin
      .from('dancecard_attendee_group_reports')
      .select('id, group_id, reason, created_at, reporter_account_id')
      .in(
        'group_id',
        groups.length ? groups.map((g) => g.id as string) : ['00000000-0000-0000-0000-000000000000'],
      )
      .order('created_at', { ascending: false })
      .limit(50)

    return NextResponse.json({ groups, reports: reports ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string } },
) {
  try {
    const slug = normalizeEventSlug(context.params.eventSlug)
    const ctx = await requireOrganizerForSlug(slug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, slug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const body = (await request.json()) as {
      groupId?: string
      curatedPin?: boolean
      status?: string
    }
    if (!body.groupId) return NextResponse.json({ error: 'groupId required' }, { status: 400 })

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.curatedPin !== undefined) patch.curated_pin = body.curatedPin
    if (body.status) patch.status = body.status

    const { error } = await admin
      .from('dancecard_attendee_groups')
      .update(patch)
      .eq('id', body.groupId)
      .eq('event_id', eventId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
