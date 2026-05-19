import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await admin
      .from('dancecard_exhibitors')
      .select('id, name, booth, hours, description, tags, specials, sort_order, view_count, is_published')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
    if (error?.code === '42P01') {
      return NextResponse.json({ exhibitors: [], needsMigration: 'dancecard_059_exhibitors.sql' })
    }
    if (error) throw error
    return NextResponse.json({ exhibitors: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  booth: z.string().max(120).nullable().optional(),
  hours: z.string().max(200).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  specials: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isPublished: z.boolean().optional(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = upsertSchema.parse(await request.json())
    const row = {
      event_id: ctx.eventId,
      name: body.name.trim(),
      booth: body.booth ?? null,
      hours: body.hours ?? null,
      description: body.description ?? null,
      tags: body.tags ?? [],
      specials: body.specials ?? null,
      sort_order: body.sortOrder ?? 0,
      is_published: body.isPublished ?? true,
    }
    if (body.id) {
      const { data, error } = await ctx.admin
        .from('dancecard_exhibitors')
        .update(row)
        .eq('id', body.id)
        .eq('event_id', ctx.eventId)
        .select('id, name, booth, hours, description, tags, specials, sort_order, view_count, is_published')
        .single()
      if (error) throw error
      return NextResponse.json({ exhibitor: data })
    }
    const { data, error } = await ctx.admin
      .from('dancecard_exhibitors')
      .insert(row)
      .select('id, name, booth, hours, description, tags, specials, sort_order, view_count, is_published')
      .single()
    if (error) throw error
    return NextResponse.json({ exhibitor: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
