import { NextResponse } from 'next/server'
import {
  assertOrganizerCanExportPii,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { csvEscape } from '@/lib/dancecard/organizerExportCsv'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExportPii(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: people, error } = await admin
      .from('dancecard_persons')
      .select('id, scene_name, legal_name, email, phone, pronouns, public_bio')
      .eq('event_id', eventId)
      .order('scene_name', { ascending: true })
    if (error) throw error
    const header = ['id', 'sceneName', 'legalName', 'email', 'phone', 'pronouns', 'publicBio']
    const lines = [header.join(',')]
    for (const p of people ?? []) {
      lines.push(
        [
          csvEscape(String(p.id)),
          csvEscape(String(p.scene_name ?? '')),
          csvEscape(String(p.legal_name ?? '')),
          csvEscape(String(p.email ?? '')),
          csvEscape(String(p.phone ?? '')),
          csvEscape(String(p.pronouns ?? '')),
          csvEscape(String(p.public_bio ?? '')),
        ].join(','),
      )
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="presenter-directory-${context.params.eventSlug}.csv"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
