import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['pending', 'review', 'approved', 'rejected']),
  organizerNotes: z.string().max(5000).optional().nullable(),
})

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string; applicationId: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const body = patchSchema.parse(await request.json())
    const { error } = await ctx.admin
      .from('dancecard_vetting_applications')
      .update({
        status: body.status,
        organizer_notes: body.organizerNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', context.params.applicationId)
      .eq('event_id', ctx.eventId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
