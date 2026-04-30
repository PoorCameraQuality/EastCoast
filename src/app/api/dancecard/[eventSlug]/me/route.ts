import { NextRequest, NextResponse } from 'next/server'
import { getDancecardAdmin, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import {
  loadPrefs,
  loadSelections,
  loadAvailabilityRange,
  setPrefsAllowCompareByUsername,
} from '@/lib/dancecard/data'
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
      },
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
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

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
    const patchSchema = z
      .object({
        displayName: displayNameSchema.optional(),
        allowCompareByUsername: z.boolean().optional(),
      })
      .refine((b) => b.displayName !== undefined || b.allowCompareByUsername !== undefined, {
        message: 'No updates provided',
      })
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

    let prefsOut: { allowCompareByUsername: boolean } | undefined
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
              'Database is missing column dancecard_prefs.allow_compare_by_username. Apply migration 20260430130000_dancecard_allow_compare_by_username.sql (or run: npm run dancecard:apply-migrations).',
          },
          { status: 503 }
        )
      }
      prefsOut = { allowCompareByUsername: body.allowCompareByUsername }
    }

    return NextResponse.json({
      ...(accountOut ? { account: accountOut } : {}),
      ...(prefsOut ? { prefs: prefsOut } : {}),
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
