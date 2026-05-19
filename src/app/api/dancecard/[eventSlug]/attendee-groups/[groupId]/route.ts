import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import {
  countActiveMembers,
  generateInviteToken,
  getMembership,
  isGroupAdmin,
  loadAccountsBrief,
  mapGroupDetail,
  optionalHttpsUrl,
  type AttendeeGroupRow,
} from '@/lib/dancecard/attendeeGroupsCore'
import { patchAttendeeGroupSchema } from '@/lib/dancecard/attendeeGroupsSchemas'
import { loadAttendeeGroupsContext, loadGroupForEvent } from '@/lib/dancecard/attendeeGroupsRoute'
import { jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    const { group, missingMigration } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (missingMigration) {
      return NextResponse.json({ error: 'Apply migration dancecard_054_attendee_groups.sql first.' }, { status: 409 })
    }
    if (!group || group.status === 'removed_by_mod') {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const g = group as AttendeeGroupRow
    if (g.visibility === 'unlisted' && !ctx.session) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    const membership = ctx.session
      ? await getMembership(ctx.admin, g.id, ctx.session.accountId)
      : null
    const memberCount = await countActiveMembers(ctx.admin, g.id)
    const owners = await loadAccountsBrief(ctx.admin, [g.created_by_account_id])

    const detail = mapGroupDetail(
      g,
      memberCount,
      membership,
      owners.get(g.created_by_account_id),
      {
        includeInviteToken: isGroupAdmin(membership?.role),
        includePrivateUrls: membership != null,
      },
    )

    return NextResponse.json({ group: detail })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-get')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; groupId: string } },
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const ctx = await loadAttendeeGroupsContext(request, context.params.eventSlug)
    if (!ctx) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    if (!ctx.session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { group, missingMigration } = await loadGroupForEvent(ctx.admin, context.params.groupId, ctx.event.id)
    if (missingMigration) {
      return NextResponse.json({ error: 'Apply migration dancecard_054_attendee_groups.sql first.' }, { status: 409 })
    }
    if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

    const membership = await getMembership(ctx.admin, context.params.groupId, ctx.session.accountId)
    if (!isGroupAdmin(membership?.role)) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const body = patchAttendeeGroupSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name !== undefined) patch.name = body.name.trim()
    if (body.description !== undefined) patch.description = body.description.trim()
    if (body.groupType !== undefined) patch.group_type = body.groupType
    if (body.visibility !== undefined) patch.visibility = body.visibility
    if (body.joinMode !== undefined) patch.join_mode = body.joinMode
    if (body.recruitmentStatus !== undefined) patch.recruitment_status = body.recruitmentStatus
    if (body.capacityMin !== undefined) patch.capacity_min = body.capacityMin
    if (body.capacityMax !== undefined) patch.capacity_max = body.capacityMax
    if (body.expectationsMd !== undefined) patch.expectations_md = body.expectationsMd.trim()
    if (body.externalDiscordUrl !== undefined) patch.external_discord_url = optionalHttpsUrl(body.externalDiscordUrl)
    if (body.externalSheetUrl !== undefined) patch.external_sheet_url = optionalHttpsUrl(body.externalSheetUrl)
    if (body.status !== undefined) patch.status = body.status
    if (body.regenerateInviteToken) patch.invite_token = generateInviteToken()

    const { error } = await ctx.admin
      .from('dancecard_attendee_groups')
      .update(patch)
      .eq('id', context.params.groupId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Attendee groups not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'attendee-group-patch')
  }
}
