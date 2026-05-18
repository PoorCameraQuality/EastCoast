import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import {
  loadPrefs,
  loadSelections,
  loadAvailabilityRange,
  saveAccountProfile,
  setPrefsAllowCompareByUsername,
} from '@/lib/dancecard/data'
import {
  mergeProfileStored,
  parseAttendeeProfileConfig,
  profilePatchForConfig,
  buildPublicProfile,
  attendeeProfileStoredSchema,
} from '@/lib/dancecard/attendeeProfile'
import { z, ZodError } from 'zod'
import { displayNameSchema } from '@/lib/dancecard/schemas'

export async function GET(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const prefs = await loadPrefs(admin, session.accountId)
    const availability = await loadAvailabilityRange(admin, session.accountId)
    const selections = await loadSelections(admin, session.accountId)
    const attendeeProfileConfig = parseAttendeeProfileConfig(
      (event as { attendee_profile_config?: unknown }).attendee_profile_config
    )
    const publicProfile = buildPublicProfile({
      displayName: session.displayName,
      username: session.username,
      stored: prefs.profile,
      config: attendeeProfileConfig,
    })
    return NextResponse.json({
      account: {
        id: session.accountId,
        username: session.username,
        displayName: session.displayName,
        isStaff: session.isStaff,
      },
      prefs: {
        bufferMinutes: prefs.bufferMinutes,
        allowCompareByUsername: prefs.allowCompareByUsername,
        availabilityStartsAt: availability?.startsAt ?? event.window_starts_at,
        availabilityEndsAt: availability?.endsAt ?? event.window_ends_at,
        profile: prefs.profile,
      },
      attendeeProfileConfig,
      publicProfile,
      selections: selections.map((s) => ({
        id: s.id,
        kind: s.kind,
        slotId: s.slot_id,
        startsAt: s.starts_at,
        endsAt: s.ends_at,
        programTitle: s.program_title,
        programRoom: s.program_room,
        programTrack: s.program_track,
        note: s.note ?? null,
      })),
    })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-me')
  }
}

const profilePatchSchema = attendeeProfileStoredSchema.partial()

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const { eventSlug } = context.params
    const slug = normalizeEventSlug(eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const attendeeProfileConfig = parseAttendeeProfileConfig(
      (event as { attendee_profile_config?: unknown }).attendee_profile_config
    )

    const patchSchema = z
      .object({
        displayName: displayNameSchema.optional(),
        allowCompareByUsername: z.boolean().optional(),
        profile: profilePatchSchema.optional(),
      })
      .refine(
        (b) =>
          b.displayName !== undefined ||
          b.allowCompareByUsername !== undefined ||
          b.profile !== undefined,
        { message: 'No updates provided' }
      )
    const body = patchSchema.parse(await request.json())

    let accountOut: { id: string; displayName: string } | undefined
    if (body.displayName !== undefined) {
      const { data, error } = await admin
        .from('dancecard_accounts')
        .update({ display_name: body.displayName })
        .eq('id', session.accountId)
        .select('id, display_name')
        .single()
      if (error) throw error
      accountOut = { id: data.id, displayName: data.display_name }
    }

    let prefsOut: {
      allowCompareByUsername?: boolean
      profile?: Record<string, unknown>
      publicProfile?: ReturnType<typeof buildPublicProfile>
    } | undefined

    if (body.allowCompareByUsername !== undefined) {
      const prefRes = await setPrefsAllowCompareByUsername(
        admin,
        session.accountId,
        body.allowCompareByUsername
      )
      if (!prefRes.ok && prefRes.reason === 'allow_compare_column_missing') {
        return NextResponse.json(
          {
            error:
              'Database is missing column dancecard_prefs.allow_compare_by_username. Apply migration dancecard_006_allow_compare_by_username.sql.',
          },
          { status: 503 }
        )
      }
      prefsOut = { ...(prefsOut ?? {}), allowCompareByUsername: body.allowCompareByUsername }
    }

    if (body.profile !== undefined) {
      const current = await loadPrefs(admin, session.accountId)
      const filtered = profilePatchForConfig(body.profile, attendeeProfileConfig)
      const merged = mergeProfileStored(current.profile, filtered)
      const saveRes = await saveAccountProfile(admin, session.accountId, merged)
      if (!saveRes.ok && saveRes.reason === 'profile_column_missing') {
        return NextResponse.json(
          {
            error:
              'Database is missing column dancecard_prefs.profile_json. Apply migration dancecard_039_attendee_profile.sql.',
          },
          { status: 503 }
        )
      }
      const displayName = accountOut?.displayName ?? session.displayName
      prefsOut = {
        ...(prefsOut ?? {}),
        profile: merged,
        publicProfile: buildPublicProfile({
          displayName,
          username: session.username,
          stored: merged,
          config: attendeeProfileConfig,
        }),
      }
    }

    return NextResponse.json({
      ...(accountOut ? { account: accountOut } : {}),
      ...(prefsOut ? { prefs: prefsOut } : {}),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-me-patch')
  }
}
