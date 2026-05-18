import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { getEventEntitlements } from '@/lib/dancecard/eventEntitlements'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  modules: z
    .object({
      schedule_embed: z.boolean().optional(),
      map_embed: z.boolean().optional(),
      shift_swaps: z.boolean().optional(),
      vetting_applications: z.boolean().optional(),
      policy_public_summary: z.boolean().optional(),
    })
    .strict(),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const event = await loadEventBySlugAnyStatus(ctx.admin, context.params.eventSlug)
    if (!event || event.id !== ctx.eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const modules = await getEventEntitlements(ctx.admin, ctx.eventId)
    return NextResponse.json({ modules })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function PATCH(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const event = await loadEventBySlugAnyStatus(ctx.admin, context.params.eventSlug)
    if (!event || event.id !== ctx.eventId) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const body = patchSchema.parse(await request.json())
    const current = await getEventEntitlements(ctx.admin, ctx.eventId)
    const next = { ...current, ...body.modules }
    const { error } = await ctx.admin.from('dancecard_event_entitlements').upsert(
      {
        event_id: ctx.eventId,
        modules: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'event_id' },
    )
    if (error) {
      if (/dancecard_event_entitlements|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Apply migration dancecard_027_phase7_embed_entitlements.sql first.' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({ modules: next })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
