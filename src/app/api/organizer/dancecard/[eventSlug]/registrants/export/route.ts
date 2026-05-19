import { NextResponse } from 'next/server'
import { assertOrganizerCanExportPii, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExportPii(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_registrants')
      .select(
        'id, category_id, status, scene_display_name, legal_name, email, phone, checked_in_at, checked_in_timing, imported_payment_status, created_at',
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    const catIds = Array.from(new Set((rows ?? []).map((r) => r.category_id as string)))
    const catName: Record<string, string> = {}
    if (catIds.length) {
      const { data: cats } = await admin.from('dancecard_registration_categories').select('id, name').in('id', catIds)
      for (const c of cats ?? []) catName[c.id as string] = String(c.name)
    }
    const header = [
      'id',
      'category',
      'status',
      'sceneDisplayName',
      'legalName',
      'email',
      'phone',
      'checkedInAt',
      'checkedInTiming',
      'importedPaymentStatus',
      'createdAt',
    ]
    const lines = [header.join(',')]
    for (const r of rows ?? []) {
      lines.push(
        [
          csvEscape(String(r.id)),
          csvEscape(catName[r.category_id as string] ?? ''),
          csvEscape(String(r.status ?? '')),
          csvEscape(String(r.scene_display_name ?? '')),
          csvEscape(String(r.legal_name ?? '')),
          csvEscape(String(r.email ?? '')),
          csvEscape(String(r.phone ?? '')),
          csvEscape(String(r.checked_in_at ?? '')),
          csvEscape(String(r.checked_in_timing ?? '')),
          csvEscape(String(r.imported_payment_status ?? '')),
          csvEscape(String(r.created_at ?? '')),
        ].join(','),
      )
    }
    return new NextResponse(lines.join('\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="registrants-${context.params.eventSlug}.csv"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
