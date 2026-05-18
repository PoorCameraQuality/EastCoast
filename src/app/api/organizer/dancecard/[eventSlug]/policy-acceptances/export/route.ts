import { NextResponse } from 'next/server'
import { assertOrganizerCanExportPii, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(request: Request, context: { params: { eventSlug: string } }) {
  try {
    const format = new URL(request.url).searchParams.get('format') === 'json' ? 'json' : 'csv'
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExportPii(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: regs, error: regErr } = await admin.from('dancecard_registrants').select('id').eq('event_id', eventId)
    if (regErr) throw regErr
    const regIds = (regs ?? []).map((r) => r.id as string)
    if (!regIds.length) {
      if (format === 'json') {
        return NextResponse.json({ acceptances: [] })
      }
      return new NextResponse(['acceptanceId,registrant,policy,acceptedAt'].join('\n'), {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="policy-acceptances-${context.params.eventSlug}.csv"`,
        },
      })
    }
    const { data: rows, error } = await admin
      .from('dancecard_registrant_policy_acceptances')
      .select('id, registrant_id, policy_document_id, accepted_at')
      .in('registrant_id', regIds)
    if (error) throw error
    const polIds = Array.from(new Set((rows ?? []).map((r) => r.policy_document_id as string)))
    const regLabel: Record<string, string> = {}
    const { data: regRows } = await admin
      .from('dancecard_registrants')
      .select('id, scene_display_name, email')
      .eq('event_id', eventId)
      .in('id', regIds)
    for (const r of regRows ?? []) {
      regLabel[r.id as string] = `${String(r.scene_display_name ?? '')} <${String(r.email ?? '')}>`
    }
    const polTitle: Record<string, string> = {}
    if (polIds.length) {
      const { data: pols } = await admin
        .from('dancecard_policy_documents')
        .select('id, title, kind, version')
        .eq('event_id', eventId)
        .in('id', polIds)
      for (const p of pols ?? []) {
        polTitle[p.id as string] = `${p.kind} v${p.version} — ${p.title}`
      }
    }
    const header = ['acceptanceId', 'registrant', 'policy', 'acceptedAt']
    const lines = [header.join(',')]
    for (const r of rows ?? []) {
      lines.push(
        [
          csvEscape(String(r.id)),
          csvEscape(regLabel[r.registrant_id as string] ?? String(r.registrant_id)),
          csvEscape(polTitle[r.policy_document_id as string] ?? String(r.policy_document_id)),
          csvEscape(String(r.accepted_at ?? '')),
        ].join(','),
      )
    }
    if (format === 'json') {
      const jsonRows = (rows ?? []).map((r) => ({
        acceptanceId: r.id,
        registrantId: r.registrant_id,
        registrant: regLabel[r.registrant_id as string] ?? r.registrant_id,
        policyDocumentId: r.policy_document_id,
        policy: polTitle[r.policy_document_id as string] ?? r.policy_document_id,
        acceptedAt: r.accepted_at,
      }))
      return NextResponse.json({ acceptances: jsonRows })
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="policy-acceptances-${context.params.eventSlug}.csv"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
