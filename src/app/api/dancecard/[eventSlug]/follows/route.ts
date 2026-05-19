import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  getDancecardAdmin,
  jsonFromRouteError,
  loadEventBySlug,
  normalizeEventSlug,
  resolveAccountFromSession,
} from '@/lib/dancecard/routeCommon'
import { rateLimiters, withRateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

const postSchema = z.object({ personId: z.string().uuid() })

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    const session = await resolveAccountFromSession(admin, request, slug)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await admin
      .from('dancecard_person_follows')
      .select('person_id, created_at, dancecard_persons(scene_name)')
      .eq('event_id', event.id)
      .eq('account_id', session.accountId)
    if (error) {
      const code = (error as { code?: string }).code
      if (code === '42P01') return NextResponse.json({ follows: [] })
      throw error
    }

    const follows = (data ?? []).map((row) => {
      const p = row.dancecard_persons as { scene_name?: string } | { scene_name?: string }[] | null
      const person = Array.isArray(p) ? p[0] : p
      return {
        personId: row.person_id as string,
        sceneName: person?.scene_name ?? '',
        createdAt: row.created_at as string,
      }
    })

    return NextResponse.json({ follows })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-follows-get')
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

    const { personId } = postSchema.parse(await request.json())

    const { data: person, error: pErr } = await admin
      .from('dancecard_persons')
      .select('id')
      .eq('id', personId)
      .eq('event_id', event.id)
      .maybeSingle()
    if (pErr) throw pErr
    if (!person) return NextResponse.json({ error: 'Presenter not found' }, { status: 404 })

    const { error } = await admin.from('dancecard_person_follows').upsert(
      {
        event_id: event.id,
        account_id: session.accountId,
        person_id: personId,
      },
      { onConflict: 'event_id,account_id,person_id' }
    )
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return jsonFromRouteError(e, 'dancecard-follows-post')
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

    const personId = request.nextUrl.searchParams.get('personId')
    if (!personId) return NextResponse.json({ error: 'personId required' }, { status: 400 })

    const { error } = await admin
      .from('dancecard_person_follows')
      .delete()
      .eq('event_id', event.id)
      .eq('account_id', session.accountId)
      .eq('person_id', personId)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-follows-delete')
  }
}
