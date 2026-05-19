import { NextResponse } from 'next/server'
import { scanDancecardConflictsForEvent } from '@/lib/dancecard/conflictScanFromEvent'
import { assertOrganizerCanExport, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { buildEventPackZip } from '@/lib/dancecard/eventPackExport'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function csvEscape(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

export async function GET(_request: Request, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanExport(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const slug = context.params.eventSlug
    const files: Array<{ name: string; content: string | Buffer }> = [
      {
        name: 'README.txt',
        content: `Event pack for ${slug}\nGenerated ${new Date().toISOString()}\nIncludes registrants and conflict report.\n`,
      },
    ]

    const { data: rows } = await admin
      .from('dancecard_registrants')
      .select(
        'id, category_id, status, scene_display_name, email, checked_in_at, checked_in_timing, created_at',
      )
      .eq('event_id', eventId)
    const header = [
      'id',
      'category',
      'status',
      'sceneDisplayName',
      'email',
      'checkedInAt',
      'checkedInTiming',
      'createdAt',
    ]
    const catIds = Array.from(new Set((rows ?? []).map((r) => r.category_id as string)))
    const catName: Record<string, string> = {}
    if (catIds.length) {
      const { data: cats } = await admin.from('dancecard_registration_categories').select('id, name').in('id', catIds)
      for (const c of cats ?? []) catName[c.id as string] = String(c.name)
    }
    const regLines = [header.join(',')]
    for (const r of rows ?? []) {
      regLines.push(
        [
          csvEscape(String(r.id)),
          csvEscape(catName[r.category_id as string] ?? ''),
          csvEscape(String(r.status ?? '')),
          csvEscape(String(r.scene_display_name ?? '')),
          csvEscape(String(r.email ?? '')),
          csvEscape(String(r.checked_in_at ?? '')),
          csvEscape(String(r.checked_in_timing ?? '')),
          csvEscape(String(r.created_at ?? '')),
        ].join(','),
      )
    }
    files.push({ name: 'registrants.csv', content: regLines.join('\n') })

    const conflicts = await scanDancecardConflictsForEvent(admin, eventId)
    const conflictCsv =
      'id,severity,title,detail\n' +
      conflicts
        .map((c) =>
          [csvEscape(c.id), csvEscape(c.severity), csvEscape(c.title), csvEscape(c.detail ?? '')].join(','),
        )
        .join('\n')
    files.push({ name: 'conflict-report.csv', content: conflictCsv })

    const zip = await buildEventPackZip(admin, eventId, slug, files)
    return new NextResponse(zip, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}-event-pack.zip"`,
      },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
