import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

function isMissingMessageTable(error: unknown) {
  const e = error as { code?: string; message?: string }
  return (
    e?.code === '42P01' ||
    /dancecard_message_campaigns|dancecard_message_templates|relation .* does not exist/i.test(e?.message ?? '')
  )
}

const createSchema = z.object({
  templateId: z.string().uuid(),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    try {
      const { data: campaigns, error } = await admin
        .from('dancecard_message_campaigns')
        .select('id, template_id, status, created_at, sent_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      if (error) throw error
      const list = campaigns ?? []
      const templateIds = Array.from(new Set(list.map((c) => c.template_id as string)))
      const nameByTpl: Record<string, string> = {}
      if (templateIds.length) {
        const { data: tpls } = await admin.from('dancecard_message_templates').select('id,name').in('id', templateIds)
        for (const t of tpls ?? []) nameByTpl[t.id as string] = String(t.name)
      }
      const out = []
      for (const c of list) {
        const { count } = await admin
          .from('dancecard_message_deliveries')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', c.id as string)
        const { count: sentCount } = await admin
          .from('dancecard_message_deliveries')
          .select('*', { count: 'exact', head: true })
          .eq('campaign_id', c.id as string)
          .eq('status', 'sent')
        out.push({
          id: c.id,
          templateId: c.template_id,
          templateName: nameByTpl[c.template_id as string] ?? '—',
          status: c.status,
          createdAt: c.created_at,
          sentAt: c.sent_at,
          deliveryTotal: typeof count === 'number' ? count : 0,
          deliverySent: typeof sentCount === 'number' ? sentCount : 0,
        })
      }
      return NextResponse.json({ campaigns: out })
    } catch (e) {
      if (isMissingMessageTable(e)) {
        return NextResponse.json({ campaigns: [], needsMigration: true })
      }
      throw e
    }
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, userId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = createSchema.parse(await request.json())
    const { data: tpl, error: tErr } = await admin
      .from('dancecard_message_templates')
      .select('id')
      .eq('id', body.templateId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (tErr) throw tErr
    if (!tpl) return NextResponse.json({ error: 'Template not found' }, { status: 400 })
    try {
      const { data: row, error } = await admin
        .from('dancecard_message_campaigns')
        .insert({
          event_id: eventId,
          template_id: body.templateId,
          status: 'draft',
          created_by_user_id: userId,
        })
        .select('id, status, created_at')
        .single()
      if (error) throw error
      return NextResponse.json({ campaign: { id: row.id, status: row.status, createdAt: row.created_at } })
    } catch (e) {
      if (isMissingMessageTable(e)) {
        return NextResponse.json(
          { error: 'Messaging requires migration dancecard_022_message_outbox.sql' },
          { status: 503 },
        )
      }
      throw e
    }
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
