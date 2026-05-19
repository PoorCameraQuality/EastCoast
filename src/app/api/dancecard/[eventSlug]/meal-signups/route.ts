import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, _request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const modules = await getEventEntitlements(admin, event.id)
    try {
      assertModuleEnabled(modules, 'meal_signups')
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: periods, error: pErr } = await admin
      .from('dancecard_meal_periods')
      .select('id, label, starts_at, ends_at, sort_order')
      .eq('event_id', event.id)
      .order('sort_order', { ascending: true })
    if (pErr?.code === '42P01') {
      return NextResponse.json({ periods: [], signups: [], needsMigration: 'dancecard_058_meal_signups.sql' })
    }
    if (pErr) throw pErr

    const { data: signups, error: sErr } = await admin
      .from('dancecard_meal_signups')
      .select('id, meal_period_id, meal_choice, dietary_notes, status')
      .eq('event_id', event.id)
      .eq('account_id', session.accountId)
      .eq('status', 'confirmed')
    if (sErr) throw sErr

    return NextResponse.json({ periods: periods ?? [], signups: signups ?? [] })
  } catch (e) {
    return jsonFromRouteError(e, 'meal-signups-get')
  }
}

const postSchema = z.object({
  mealPeriodId: z.string().uuid(),
  mealChoice: z.string().min(1).max(120),
  dietaryNotes: z.string().max(500).optional(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'meal_signups')

    const body = postSchema.parse(await request.json())
    const { data, error } = await admin
      .from('dancecard_meal_signups')
      .upsert(
        {
          event_id: event.id,
          account_id: session.accountId,
          meal_period_id: body.mealPeriodId,
          meal_choice: body.mealChoice.trim(),
          dietary_notes: body.dietaryNotes?.trim() || null,
          status: 'confirmed',
        },
        { onConflict: 'meal_period_id,account_id' },
      )
      .select('id, meal_period_id, meal_choice, dietary_notes, status')
      .single()
    if (error?.code === '42P01') {
      return NextResponse.json({ error: 'Apply migration dancecard_058_meal_signups.sql' }, { status: 503 })
    }
    if (error) throw error
    return NextResponse.json({ signup: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'meal-signups-post')
  }
}
