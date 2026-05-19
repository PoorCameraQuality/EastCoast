import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPolicyDocumentPatchSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  context: { params: { eventSlug: string; policyId: string } }
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const body = organizerPolicyDocumentPatchSchema.parse(await request.json())
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (body.title !== undefined) patch.title = body.title
    if (body.bodyMarkdown !== undefined) patch.body_markdown = body.bodyMarkdown
    if (body.publishedAt !== undefined) {
      patch.published_at = body.publishedAt ? new Date(body.publishedAt).toISOString() : null
    }
    const { data: row, error } = await admin
      .from('dancecard_policy_documents')
      .update(patch)
      .eq('id', context.params.policyId)
      .eq('event_id', eventId)
      .select('id, kind, version, title, body_markdown, published_at, created_at, updated_at')
      .maybeSingle()
    if (error) throw error
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({
      document: {
        id: row.id as string,
        kind: row.kind as string,
        version: Number(row.version),
        title: row.title as string,
        bodyMarkdown: row.body_markdown as string,
        publishedAt: (row.published_at as string | null) ?? null,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}

export async function DELETE(_request: NextRequest, context: { params: { eventSlug: string; policyId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId } = ctx
    const { data: deleted, error } = await admin
      .from('dancecard_policy_documents')
      .delete()
      .eq('id', context.params.policyId)
      .eq('event_id', eventId)
      .select('id')
      .maybeSingle()
    if (error) throw error
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
