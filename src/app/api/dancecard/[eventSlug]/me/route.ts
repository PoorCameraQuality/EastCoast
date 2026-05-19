import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession, jsonFromRouteError } from '@/lib/dancecard/routeCommon'
import {
  loadPrefs,
  loadSelections,
  loadAvailabilityRange,
  saveAccountProfile,
  setPrefsAllowCompareByUsername,
  setPrefsComparePrivacy,
  setPrefsIcsRemindBeforeMinutes,
  setPrefsSocialFields,
} from '@/lib/dancecard/data'
import type { CompareVisibility } from '@/lib/dancecard/comparePrivacy'
import {
  mergeProfileStored,
  parseAttendeeProfileConfig,
  profilePatchForConfig,
  attendeeProfileStoredSchema,
} from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfileResolved } from '@/lib/dancecard/profilePhotoUrl'
import { z, ZodError } from 'zod'
import { displayNameSchema } from '@/lib/dancecard/schemas'
import { resolveRegistrantForDancecardAccount } from '@/lib/dancecard/ensureSelfServiceRegistrant'

export const dynamic = 'force-dynamic'

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
    const publicProfile = await buildPublicProfileResolved(admin, {
      displayName: session.displayName,
      username: session.username,
      stored: prefs.profile,
      config: attendeeProfileConfig,
    })
    const linked = await resolveRegistrantForDancecardAccount(admin, event.id, session.accountId, session.displayName, {
      ensure: false,
    })
    let badgeTagline: string | null = null
    if (linked?.id) {
      const { data: regRow } = await admin
        .from('dancecard_registrants')
        .select('badge_tagline')
        .eq('id', linked.id)
        .maybeSingle()
      badgeTagline = (regRow?.badge_tagline as string | null) ?? null
    }
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
        compareVisibility: prefs.compareVisibility,
        showInCompareDirectory: prefs.showInCompareDirectory,
        hideBusyDetailsInCompare: prefs.hideBusyDetailsInCompare,
        icsRemindBeforeMinutes: prefs.icsRemindBeforeMinutes,
        favoritedSlotIds: prefs.favoritedSlotIds,
        showInAttendeeDirectory: prefs.showInAttendeeDirectory,
        showAttendingStatus: prefs.showAttendingStatus,
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
      registrant: linked ? { id: linked.id, badgeTagline } : null,
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

    const compareVisibilitySchema = z.enum(['off', 'username', 'link_only'])

    const patchSchema = z
      .object({
        displayName: displayNameSchema.optional(),
        allowCompareByUsername: z.boolean().optional(),
        compareVisibility: compareVisibilitySchema.optional(),
        showInCompareDirectory: z.boolean().optional(),
        hideBusyDetailsInCompare: z.boolean().optional(),
        icsRemindBeforeMinutes: z.number().int().min(0).max(1440).optional(),
        profile: profilePatchSchema.optional(),
        badgeTagline: z.string().max(200).nullable().optional(),
        favoritedSlotIds: z.array(z.string().uuid()).max(500).optional(),
        showInAttendeeDirectory: z.boolean().optional(),
        showAttendingStatus: z.boolean().optional(),
      })
      .refine(
        (b) =>
          b.displayName !== undefined ||
          b.allowCompareByUsername !== undefined ||
          b.compareVisibility !== undefined ||
          b.showInCompareDirectory !== undefined ||
          b.hideBusyDetailsInCompare !== undefined ||
          b.icsRemindBeforeMinutes !== undefined ||
          b.profile !== undefined ||
          b.badgeTagline !== undefined ||
          b.favoritedSlotIds !== undefined ||
          b.showInAttendeeDirectory !== undefined ||
          b.showAttendingStatus !== undefined,
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
      compareVisibility?: CompareVisibility
      showInCompareDirectory?: boolean
      hideBusyDetailsInCompare?: boolean
      icsRemindBeforeMinutes?: number
      favoritedSlotIds?: string[]
      showInAttendeeDirectory?: boolean
      showAttendingStatus?: boolean
      profile?: Record<string, unknown>
      publicProfile?: Awaited<ReturnType<typeof buildPublicProfileResolved>>
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
      const vis: CompareVisibility = body.allowCompareByUsername ? 'username' : 'off'
      prefsOut = {
        ...(prefsOut ?? {}),
        allowCompareByUsername: body.allowCompareByUsername,
        compareVisibility: vis,
      }
    }

    if (
      body.compareVisibility !== undefined ||
      body.showInCompareDirectory !== undefined ||
      body.hideBusyDetailsInCompare !== undefined
    ) {
      const privacyRes = await setPrefsComparePrivacy(admin, session.accountId, {
        compareVisibility: body.compareVisibility,
        showInCompareDirectory: body.showInCompareDirectory,
        hideBusyDetailsInCompare: body.hideBusyDetailsInCompare,
      })
      if (!privacyRes.ok) {
        return NextResponse.json(
          { error: 'Database is missing compare privacy columns. Apply migration dancecard_047_compare_privacy.sql.' },
          { status: 503 }
        )
      }
      if (body.compareVisibility !== undefined) {
        prefsOut = {
          ...(prefsOut ?? {}),
          compareVisibility: body.compareVisibility,
          allowCompareByUsername: body.compareVisibility === 'username',
        }
      }
      if (body.showInCompareDirectory !== undefined) {
        prefsOut = { ...(prefsOut ?? {}), showInCompareDirectory: body.showInCompareDirectory }
      }
      if (body.hideBusyDetailsInCompare !== undefined) {
        prefsOut = { ...(prefsOut ?? {}), hideBusyDetailsInCompare: body.hideBusyDetailsInCompare }
      }
    }

    if (body.icsRemindBeforeMinutes !== undefined) {
      const icsRes = await setPrefsIcsRemindBeforeMinutes(admin, session.accountId, body.icsRemindBeforeMinutes)
      if (!icsRes.ok) {
        return NextResponse.json(
          { error: 'Database is missing ics_remind_before_minutes. Apply migration dancecard_045_ics_reminders.sql.' },
          { status: 503 }
        )
      }
      prefsOut = { ...(prefsOut ?? {}), icsRemindBeforeMinutes: body.icsRemindBeforeMinutes }
    }

    if (
      body.favoritedSlotIds !== undefined ||
      body.showInAttendeeDirectory !== undefined ||
      body.showAttendingStatus !== undefined
    ) {
      const socialRes = await setPrefsSocialFields(admin, session.accountId, {
        favoritedSlotIds: body.favoritedSlotIds,
        showInAttendeeDirectory: body.showInAttendeeDirectory,
        showAttendingStatus: body.showAttendingStatus,
      })
      if (!socialRes.ok) {
        return NextResponse.json(
          { error: 'Database is missing social prefs columns. Apply migration dancecard_057_compare_social_prefs.sql.' },
          { status: 503 },
        )
      }
      if (body.favoritedSlotIds !== undefined) {
        prefsOut = { ...(prefsOut ?? {}), favoritedSlotIds: body.favoritedSlotIds }
      }
      if (body.showInAttendeeDirectory !== undefined) {
        prefsOut = { ...(prefsOut ?? {}), showInAttendeeDirectory: body.showInAttendeeDirectory }
      }
      if (body.showAttendingStatus !== undefined) {
        prefsOut = { ...(prefsOut ?? {}), showAttendingStatus: body.showAttendingStatus }
      }
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
        publicProfile: await buildPublicProfileResolved(admin, {
          displayName,
          username: session.username,
          stored: merged,
          config: attendeeProfileConfig,
        }),
      }
    }

    let registrantOut: { id: string; badgeTagline: string | null } | undefined
    if (body.badgeTagline !== undefined) {
      const linked = await resolveRegistrantForDancecardAccount(
        admin,
        event.id,
        session.accountId,
        session.displayName,
        { ensure: true },
      )
      if (linked?.id) {
        await admin
          .from('dancecard_registrants')
          .update({ badge_tagline: body.badgeTagline, updated_at: new Date().toISOString() })
          .eq('id', linked.id)
          .eq('event_id', event.id)
        registrantOut = { id: linked.id, badgeTagline: body.badgeTagline }
      }
    }

    return NextResponse.json({
      ...(accountOut ? { account: accountOut } : {}),
      ...(prefsOut ? { prefs: prefsOut } : {}),
      ...(registrantOut ? { registrant: registrantOut } : {}),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-me-patch')
  }
}
