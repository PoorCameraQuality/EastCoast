import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { isCompareBlocked, compareVisibilityAllowsUsername } from '@/lib/dancecard/comparePrivacy'
import { loadPrefs } from '@/lib/dancecard/data'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { usernameSchema } from '@/lib/dancecard/schemas'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  username: usernameSchema,
  message: z.string().max(280).optional(),
  intent: z.enum(['practice', 'social', 'schedule']).optional(),
})

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await admin
      .from('dancecard_compare_requests')
      .select(
        'id, from_account_id, to_account_id, status, message, created_at, responded_at'
      )
      .eq('event_id', event.id)
      .eq('to_account_id', session.accountId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    if (error) {
      const code = (error as { code?: string }).code
      if (code === '42P01') return NextResponse.json({ incoming: [] })
      throw error
    }

    const fromIds = Array.from(new Set((data ?? []).map((r) => r.from_account_id as string)))
    const { data: accounts } = fromIds.length
      ? await admin.from('dancecard_accounts').select('id, username, display_name').in('id', fromIds)
      : { data: [] }
    const byId = new Map((accounts ?? []).map((a) => [a.id as string, a]))

    const incoming = (data ?? []).map((r) => {
      const from = byId.get(r.from_account_id as string)
      return {
        id: r.id as string,
        message: r.message as string | null,
        createdAt: r.created_at as string,
        from: {
          username: (from?.username as string) ?? '',
          sceneName: (from?.display_name as string) ?? '',
        },
      }
    })

    return NextResponse.json({ incoming })
  } catch (e) {
    return jsonFromRouteError(e, 'compare-requests-get')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardCompare)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { username, message, intent } = postSchema.parse(await request.json())

    const { data: target, error: tErr } = await admin
      .from('dancecard_accounts')
      .select('id')
      .eq('event_id', event.id)
      .eq('username', username.trim().toLowerCase())
      .maybeSingle()
    if (tErr) throw tErr
    if (!target?.id) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === session.accountId) {
      return NextResponse.json({ error: 'Cannot request compare with yourself' }, { status: 400 })
    }

    if (await isCompareBlocked(admin, event.id, session.accountId, target.id)) {
      return NextResponse.json({ error: 'Compare not available' }, { status: 404 })
    }

    const targetPrefs = await loadPrefs(admin, target.id)
    if (!compareVisibilityAllowsUsername(targetPrefs.compareVisibility)) {
      return NextResponse.json({ error: 'Compare not available' }, { status: 404 })
    }

    const { data: existing } = await admin
      .from('dancecard_compare_requests')
      .select('id')
      .eq('event_id', event.id)
      .eq('from_account_id', session.accountId)
      .eq('to_account_id', target.id)
      .eq('status', 'pending')
      .maybeSingle()

    if (existing?.id) {
      return NextResponse.json({ ok: true, requestId: existing.id, duplicate: true })
    }

    const insertRow: Record<string, unknown> = {
      event_id: event.id,
      from_account_id: session.accountId,
      to_account_id: target.id,
      message: message?.trim() || null,
      status: 'pending',
    }
    if (intent) insertRow.intent = intent

    const { data: inserted, error } = await admin
      .from('dancecard_compare_requests')
      .insert(insertRow)
      .select('id')
      .single()
    if (error) throw error

    return NextResponse.json({ ok: true, requestId: inserted.id })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'compare-requests-post')
  }
}
