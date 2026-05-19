import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const bodySchema = z.object({
  action: z.enum(['accept', 'decline']),
})

export async function POST(
  request: NextRequest,
  context: { params: { eventSlug: string; requestId: string } }
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action } = bodySchema.parse(await request.json())
    const requestId = context.params.requestId

    const { data: row, error: fErr } = await admin
      .from('dancecard_compare_requests')
      .select('id, to_account_id, from_account_id, status')
      .eq('id', requestId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (fErr) throw fErr
    if (!row || row.to_account_id !== session.accountId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }
    if (row.status !== 'pending') {
      return NextResponse.json({ error: 'Request already handled' }, { status: 400 })
    }

    const status = action === 'accept' ? 'accepted' : 'declined'
    const { error: uErr } = await admin
      .from('dancecard_compare_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', requestId)
    if (uErr) throw uErr

    if (action === 'accept') {
      const { data: fromAcc } = await admin
        .from('dancecard_accounts')
        .select('username')
        .eq('id', row.from_account_id)
        .maybeSingle()
      return NextResponse.json({
        ok: true,
        status,
        compareUsername: fromAcc?.username ?? null,
      })
    }

    return NextResponse.json({ ok: true, status })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'compare-requests-respond')
  }
}
