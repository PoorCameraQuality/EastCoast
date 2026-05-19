import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { listCompareBlocks } from '@/lib/dancecard/comparePrivacy'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { usernameSchema } from '@/lib/dancecard/schemas'

export const dynamic = 'force-dynamic'

const postSchema = z.object({ username: usernameSchema })

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const blocks = await listCompareBlocks(admin, event.id, session.accountId)
    return NextResponse.json({ blocks })
  } catch (e) {
    return jsonFromRouteError(e, 'compare-blocks-get')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { username } = postSchema.parse(await request.json())
    const { data: target, error: tErr } = await admin
      .from('dancecard_accounts')
      .select('id')
      .eq('event_id', event.id)
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()
    if (tErr) throw tErr
    if (!target?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === session.accountId) {
      return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })
    }

    const { error } = await admin.from('dancecard_compare_blocks').upsert(
      {
        event_id: event.id,
        blocker_account_id: session.accountId,
        blocked_account_id: target.id,
      },
      { onConflict: 'event_id,blocker_account_id,blocked_account_id' }
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'compare-blocks-post')
  }
}

export async function DELETE(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const blockedAccountId = request.nextUrl.searchParams.get('accountId')
    if (!blockedAccountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })

    const { error } = await admin
      .from('dancecard_compare_blocks')
      .delete()
      .eq('event_id', event.id)
      .eq('blocker_account_id', session.accountId)
      .eq('blocked_account_id', blockedAccountId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'compare-blocks-delete')
  }
}
