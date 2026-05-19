import { NextRequest, NextResponse } from 'next/server'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { parseAttendeeProfileConfig } from '@/lib/dancecard/attendeeProfile'
import { buildPublicProfileResolved } from '@/lib/dancecard/profilePhotoUrl'
import { loadPrefs } from '@/lib/dancecard/data'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

function attendeePostVisible(post: { visibility: string; status: string }) {
  return post.status === 'active' && post.visibility === 'public'
}

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
  const limited = await withRateLimit(request, rateLimiters.dancecardPublicForm)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const postId = context.params.postId

    const { data: post, error: pErr } = await admin
      .from('dancecard_iso_posts')
      .select('id, account_id, event_id, status, visibility, contact_reveal')
      .eq('id', postId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!post || !attendeePostVisible(post as { visibility: string; status: string })) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    if (post.account_id === session.accountId) {
      return NextResponse.json({ error: 'Cannot express interest on your own post' }, { status: 400 })
    }

    const { data: interest, error: iErr } = await admin
      .from('dancecard_iso_interests')
      .upsert(
        { iso_post_id: postId, from_account_id: session.accountId, status: 'pending' },
        { onConflict: 'iso_post_id,from_account_id' }
      )
      .select('id, status')
      .single()
    if (iErr) throw iErr

    return NextResponse.json({ ok: true, interestId: interest.id, status: interest.status })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-interest')
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; postId: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'iso_board')

    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const interestId = (await request.json()) as { interestId?: string; action?: string }
    if (!interestId.interestId || !interestId.action) {
      return NextResponse.json({ error: 'interestId and action required' }, { status: 400 })
    }

    const { data: row, error: fErr } = await admin
      .from('dancecard_iso_interests')
      .select('id, iso_post_id, from_account_id, status, dancecard_iso_posts(account_id, contact_reveal, event_id)')
      .eq('id', interestId.interestId)
      .maybeSingle()
    if (fErr) throw fErr
    if (!row) return NextResponse.json({ error: 'Interest not found' }, { status: 404 })

    const postRaw = row.dancecard_iso_posts as
      | { account_id?: string; contact_reveal?: string; event_id?: string }
      | { account_id?: string; contact_reveal?: string; event_id?: string }[]
    const post = Array.isArray(postRaw) ? postRaw[0] : postRaw
    if (!post || post.event_id !== event.id || post.account_id !== session.accountId) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 })
    }

    const status = interestId.action === 'accept' ? 'accepted' : 'declined'
    const { error: uErr } = await admin
      .from('dancecard_iso_interests')
      .update({ status })
      .eq('id', interestId.interestId)
    if (uErr) throw uErr

    let revealedProfile = null
    if (status === 'accepted' && post.contact_reveal === 'on_interest') {
      const { data: fromAcc } = await admin
        .from('dancecard_accounts')
        .select('display_name, username')
        .eq('id', row.from_account_id)
        .maybeSingle()
      const prefs = await loadPrefs(admin, row.from_account_id as string)
      const config = parseAttendeeProfileConfig(
        (event as { attendee_profile_config?: unknown }).attendee_profile_config
      )
      revealedProfile = await buildPublicProfileResolved(admin, {
        displayName: (fromAcc?.display_name as string) ?? '',
        username: (fromAcc?.username as string) ?? '',
        stored: prefs.profile,
        config,
      })
    }

    return NextResponse.json({ ok: true, status, revealedProfile })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'ISO board not enabled' }, { status: 403 })
    return jsonFromRouteError(e, 'iso-interest-respond')
  }
}
