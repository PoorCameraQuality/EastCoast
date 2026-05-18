import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { organizerPolicyDocumentCreateSchema } from '@/lib/dancecard/organizerSchemas'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const { data: rows, error } = await admin
      .from('dancecard_policy_documents')
      .select('id, kind, version, title, body_markdown, published_at, created_at, updated_at')
      .eq('event_id', eventId)
      .order('kind', { ascending: true })
      .order('version', { ascending: false })
    if (error) throw error
    return NextResponse.json({
      documents: (rows ?? []).map((r) => ({
        id: r.id as string,
        kind: r.kind as string,
        version: Number(r.version),
        title: r.title as string,
        bodyMarkdown: r.body_markdown as string,
        publishedAt: (r.published_at as string | null) ?? null,
        createdAt: r.created_at as string,
        updatedAt: r.updated_at as string,
      })),
    })
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
    const body = organizerPolicyDocumentCreateSchema.parse(await request.json())
    const version = body.version ?? 1
    const { data: row, error } = await admin
      .from('dancecard_policy_documents')
      .insert({
        event_id: eventId,
        kind: body.kind,
        version,
        title: body.title,
        body_markdown: body.bodyMarkdown ?? '',
        published_at: body.publishedAt ? new Date(body.publishedAt).toISOString() : null,
      })
      .select('id, kind, version, title, body_markdown, published_at, created_at, updated_at')
      .single()
    if (error) throw error
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
