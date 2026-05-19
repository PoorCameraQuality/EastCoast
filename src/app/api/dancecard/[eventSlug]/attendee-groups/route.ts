import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { parseEventProfile, defaultGroupTypeForProfile } from '@/lib/dancecard/eventProfile'
import {
  addMember,
  countActiveMembers,
  generateInviteToken,
  isDiscoverableGroup,
  loadAccountsBrief,
  mapPublicGroupListItem,
  optionalHttpsUrl,
  ATTENDEE_GROUP_DISCLAIMER,
  type AttendeeGroupRow,
} from '@/lib/dancecard/attendeeGroupsCore'
import { createAttendeeGroupSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const url = new URL(request.url)
    const typeFilter = url.searchParams.get('type')
    const seekingOnly = url.searchParams.get('seeking') === '1'

    let q = ctx.admin
      .from('dancecard_attendee_groups')
      .select('*')
      .eq('event_id', ctx.event.id)
      .eq('status', 'active')
      .order('curated_pin', { ascending: false })
      .order('created_at', { ascending: false })

    const { data, error } = await q
    if (error) {
      if ((error as { code?: string }).code === '42P01') {
        return NextResponse.json({ groups: [], disclaimer: ATTENDEE_GROUP_DISCLAIMER })
      }
      throw error
    }

    let rows = (data ?? []) as AttendeeGroupRow[]
    rows = rows.filter((g) => isDiscoverableGroup(g))
    if (typeFilter) rows = rows.filter((g) => g.group_type === typeFilter)
    if (seekingOnly) rows = rows.filter((g) => g.recruitment_status === 'seeking')

    const ownerIds = rows.map((g) => g.created_by_account_id)
    const owners = await loadAccountsBrief(ctx.admin, ownerIds)
    const counts = await Promise.all(rows.map((g) => countActiveMembers(ctx.admin, g.id)))

    const groups = rows.map((g, i) =>
      mapPublicGroupListItem(g, counts[i], owners.get(g.created_by_account_id), ctx.session?.accountId ?? null),
    )

    return NextResponse.json({ groups, disclaimer: ATTENDEE_GROUP_DISCLAIMER })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) {
      return NextResponse.json({ error: 'Attendee groups not enabled for this event' }, { status: 403 })
    }
    return jsonFromRouteError(e, 'attendee-groups-get')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { count: createdToday } = await ctx.admin
      .from('dancecard_attendee_groups')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', ctx.event.id)
      .eq('created_by_account_id', ctx.session.accountId)
      .gte('created_at', since)
    if ((createdToday ?? 0) >= 3) {
      return NextResponse.json({ error: 'You can create at most 3 groups per day.' }, { status: 429 })
    }

    const body = createAttendeeGroupSchema.parse(await request.json())
    const profile = parseEventProfile((ctx.event as { event_profile?: unknown }).event_profile)
    const token = generateInviteToken()

    const { data, error } = await ctx.admin
      .from('dancecard_attendee_groups')
      .insert({
        event_id: ctx.event.id,
        created_by_account_id: ctx.session.accountId,
        name: body.name.trim(),
        description: (body.description ?? '').trim(),
        group_type: body.groupType ?? defaultGroupTypeForProfile(profile),
        visibility: body.visibility ?? 'public',
        join_mode: body.joinMode ?? 'apply',
        recruitment_status: body.recruitmentStatus ?? 'seeking',
        capacity_min: body.capacityMin ?? null,
        capacity_max: body.capacityMax ?? null,
        expectations_md: (body.expectationsMd ?? '').trim(),
        external_discord_url: optionalHttpsUrl(body.externalDiscordUrl),
        external_sheet_url: optionalHttpsUrl(body.externalSheetUrl),
        invite_token: token,
        status: 'active',
      })
      .select('id')
      .single()
    if (error) throw error

    await addMember(ctx.admin, data.id as string, ctx.session.accountId, 'owner')

    return NextResponse.json({ ok: true, id: data.id, inviteToken: token })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-groups-post')
  }
}
