import { NextRequest, NextResponse } from 'next/server'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { mapTrustedRoleQuestion, mapTrustedRoleRow } from '@/lib/dancecard/trustedRoles'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: { eventSlug: string; applySlug: string } },
) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'vetting_applications')

    const applySlug = context.params.applySlug.trim().toLowerCase()
    const { data: row, error } = await admin
      .from('dancecard_trusted_roles')
      .select('id, name, apply_slug, description, status, intro_text, confirmation_text, sort_order, created_at, updated_at')
      .eq('event_id', event.id)
      .eq('status', 'published')
      .ilike('apply_slug', applySlug)
      .maybeSingle()
    if (error) {
      if (/dancecard_trusted_roles|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      throw error
    }
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: qs, error: qErr } = await admin
      .from('dancecard_trusted_role_questions')
      .select('*')
      .eq('role_id', row.id)
      .order('sort_order', { ascending: true })
    if (qErr) throw qErr

    return NextResponse.json({
      eventTitle: event.event_title,
      timezone: event.timezone,
      role: mapTrustedRoleRow(
        row as Record<string, unknown>,
        (qs ?? []).map((q) => mapTrustedRoleQuestion(q as Record<string, unknown>)),
      ),
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Applications closed for this event.' }, { status: 403 })
    const msg = e instanceof Error ? e.message : 'Error'
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-trusted-roles-[applySlug]')
  }
}
