import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { getDancecardAdmin, jsonFromRouteError, loadEventBySlug, normalizeEventSlug, resolveAccountFromSession } from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  fromShiftId: z.string().uuid(),
  toShiftId: z.string().uuid(),
  note: z.string().max(2000).optional(),
})

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'shift_swaps')
    const { data, error } = await admin
      .from('dancecard_shift_swap_requests')
      .select('id, from_shift_id, to_shift_id, status, note, created_at')
      .eq('event_id', event.id)
      .eq('requester_account_id', session.accountId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      if (/dancecard_shift_swap_requests|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ swaps: [], needsMigration: true })
      }
      throw error
    }
    return NextResponse.json({ swaps: data ?? [] })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Shift swaps disabled for this event.' }, { status: 403 })
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-shift-swaps')
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  const limited = await withRateLimit(request, rateLimiters.dancecardStaffClaim)
  if (limited) return limited

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'shift_swaps')
    const body = postSchema.parse(await request.json())
    if (body.fromShiftId === body.toShiftId) {
      return NextResponse.json({ error: 'Shifts must differ' }, { status: 400 })
    }
    const { data: from, error: fErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, event_id, claimed_by_account_id, shift_status')
      .eq('id', body.fromShiftId)
      .maybeSingle()
    if (fErr) throw fErr
    const { data: to, error: tErr } = await admin
      .from('dancecard_staff_shifts')
      .select('id, event_id, claimed_by_account_id, shift_status')
      .eq('id', body.toShiftId)
      .maybeSingle()
    if (tErr) throw tErr
    if (!from || !to || from.event_id !== event.id || to.event_id !== event.id) {
      return NextResponse.json({ error: 'Invalid shifts' }, { status: 400 })
    }
    if (from.claimed_by_account_id !== session.accountId) {
      return NextResponse.json({ error: 'You can only offer a shift you have claimed.' }, { status: 403 })
    }
    const { data: inserted, error: insErr } = await admin
      .from('dancecard_shift_swap_requests')
      .insert({
        event_id: event.id,
        from_shift_id: body.fromShiftId,
        to_shift_id: body.toShiftId,
        requester_account_id: session.accountId,
        note: body.note ?? null,
        status: 'pending',
      })
      .select('id, status, created_at')
      .single()
    if (insErr) {
      if (/dancecard_shift_swap_requests|42P01|does not exist/i.test(insErr.message)) {
        return NextResponse.json({ error: 'Apply migration dancecard_027_phase7_embed_entitlements.sql first.' }, { status: 409 })
      }
      throw insErr
    }
    return NextResponse.json({ swap: inserted })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Shift swaps disabled for this event.' }, { status: 403 })
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-shift-swaps')
  }
}
