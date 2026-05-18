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
    /dancecard_message_templates|dancecard_message_campaigns|relation .* does not exist/i.test(e?.message ?? '')
  )
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  subject: z.string().min(1).max(200),
  bodyText: z.string().min(1).max(20000),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    try {
      const { data, error } = await admin
        .from('dancecard_message_templates')
        .select('id, name, subject, body_text, created_at, updated_at')
        .eq('event_id', eventId)
        .order('updated_at', { ascending: false })
      if (error) throw error
      return NextResponse.json({
        templates: (data ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          subject: r.subject,
          bodyText: r.body_text,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })),
      })
    } catch (e) {
      if (isMissingMessageTable(e)) {
        return NextResponse.json({ templates: [], needsMigration: true })
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
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = createSchema.parse(await request.json())
    try {
      const { data, error } = await admin
        .from('dancecard_message_templates')
        .insert({
          event_id: eventId,
          name: body.name.trim(),
          subject: body.subject.trim(),
          body_text: body.bodyText.trim(),
        })
        .select('id, name, subject, body_text, created_at, updated_at')
        .single()
      if (error) throw error
      return NextResponse.json({
        template: {
          id: data.id,
          name: data.name,
          subject: data.subject,
          bodyText: data.body_text,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      })
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
