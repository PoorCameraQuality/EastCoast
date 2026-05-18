import { NextRequest, NextResponse } from 'next/server'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

/** Published policy documents for attendee-facing flows (signing, summaries) without module gate. */
export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: rows, error } = await admin
      .from('dancecard_policy_documents')
      .select('id, kind, version, title, published_at, body_markdown')
      .eq('event_id', event.id)
      .not('published_at', 'is', null)
      .order('kind', { ascending: true })
      .order('version', { ascending: false })

    if (error) throw error

    const policies = (rows ?? []).map((r) => ({
      id: r.id as string,
      kind: r.kind as string,
      version: Number(r.version),
      title: r.title as string,
      publishedAt: r.published_at as string,
      bodyMarkdown: String((r as { body_markdown?: string }).body_markdown ?? ''),
    }))

    return NextResponse.json({ eventTitle: event.event_title, policies })
  } catch (e) {
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-published-policies')
  }
}
