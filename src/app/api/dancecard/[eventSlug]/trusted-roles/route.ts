import { NextRequest, NextResponse } from 'next/server'
import { getEventEntitlements, assertModuleEnabled } from '@/lib/dancecard/eventEntitlements'
import { mapTrustedRoleRow } from '@/lib/dancecard/trustedRoles'
import {getDancecardAdmin, loadEventBySlug, normalizeEventSlug, jsonFromRouteError } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug(context.params.eventSlug)
    const event = await loadEventBySlug(admin, slug)
    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const modules = await getEventEntitlements(admin, event.id)
    assertModuleEnabled(modules, 'vetting_applications')

    const { data, error } = await admin
      .from('dancecard_trusted_roles')
      .select('id, name, apply_slug, description, status, intro_text, confirmation_text, sort_order')
      .eq('event_id', event.id)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })
    if (error) {
      if (/dancecard_trusted_roles|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ roles: [] })
      }
      throw error
    }

    return NextResponse.json({
      roles: (data ?? []).map((r) => {
        const mapped = mapTrustedRoleRow(r as Record<string, unknown>, [])
        return {
          id: mapped.id,
          name: mapped.name,
          applySlug: mapped.applySlug,
          description: mapped.description,
          introText: mapped.introText,
          confirmationText: mapped.confirmationText,
        }
      }),
    })
  } catch (e) {
    const status = (e as Error & { status?: number }).status
    if (status === 403) return NextResponse.json({ error: 'Applications closed for this event.' }, { status: 403 })
    const msg = e instanceof Error ? e.message : 'Error'
    return jsonFromRouteError(e, 'dancecard-[eventSlug]-trusted-roles')
  }
}
