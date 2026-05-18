import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import {
  assertOrganizerCanMutate,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  subject: z.string().min(1).max(200).optional(),
  bodyText: z.string().min(1).max(20000).optional(),
})

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; templateId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const body = patchSchema.parse(await request.json())
    if (!body.name && !body.subject && !body.bodyText) {
      return NextResponse.json({ error: 'No updates' }, { status: 400 })
    }
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.name) row.name = body.name.trim()
    if (body.subject) row.subject = body.subject.trim()
    if (body.bodyText) row.body_text = body.bodyText.trim()
    const { data, error } = await admin
      .from('dancecard_message_templates')
      .update(row)
      .eq('id', context.params.templateId)
      .eq('event_id', eventId)
      .select('id, name, subject, body_text, updated_at')
      .maybeSingle()
    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      template: {
        id: data.id,
        name: data.name,
        subject: data.subject,
        bodyText: data.body_text,
        updatedAt: data.updated_at,
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; templateId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const { error, count } = await admin
      .from('dancecard_message_templates')
      .delete({ count: 'exact' })
      .eq('id', context.params.templateId)
      .eq('event_id', eventId)
    if (error) throw error
    if (!count) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
