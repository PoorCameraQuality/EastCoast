import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const { data, error } = await admin
      .from('dancecard_meal_periods')
      .select('id, label, starts_at, ends_at, sort_order')
      .eq('event_id', eventId)
      .order('sort_order', { ascending: true })
    if (error?.code === '42P01') {
      return NextResponse.json({ periods: [], needsMigration: 'dancecard_058_meal_signups.sql' })
    }
    if (error) throw error
    return NextResponse.json({ periods: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

const postSchema = z.object({
  label: z.string().min(1).max(120),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
  sortOrder: z.number().int().optional(),
})

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = postSchema.parse(await request.json())
    const { data, error } = await ctx.admin
      .from('dancecard_meal_periods')
      .insert({
        event_id: ctx.eventId,
        label: body.label.trim(),
        starts_at: body.startsAt ?? null,
        ends_at: body.endsAt ?? null,
        sort_order: body.sortOrder ?? 0,
      })
      .select('id, label, starts_at, ends_at, sort_order')
      .single()
    if (error) throw error
    return NextResponse.json({ period: data })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
