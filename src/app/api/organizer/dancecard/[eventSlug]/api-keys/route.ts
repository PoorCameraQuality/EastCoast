import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { hashApiKey, mintApiKeyRaw } from '@/lib/dancecard/externalApiAuth'
import { insertDancecardAuditLog } from '@/lib/dancecard/auditLog'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  name: z.string().min(1).max(120),
  scopes: z.array(z.string().min(1).max(64)).min(1).max(20),
})

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const { data, error } = await ctx.admin
      .from('dancecard_api_keys')
      .select('id, name, scopes, created_at, revoked_at, last_used_at')
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ keys: data ?? [] })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const body = postSchema.parse(await request.json())
    const raw = mintApiKeyRaw()
    const secret_hash = hashApiKey(raw)
    const { data, error } = await ctx.admin
      .from('dancecard_api_keys')
      .insert({
        event_id: ctx.eventId,
        name: body.name,
        secret_hash,
        scopes: body.scopes,
        created_by_user_id: ctx.userId,
      })
      .select('id, name, scopes, created_at')
      .single()
    if (error || !data) throw error ?? new Error('insert failed')
    await insertDancecardAuditLog(ctx.admin, {
      actorUserId: ctx.userId,
      eventId: ctx.eventId,
      action: 'api_key.mint',
      metadata: { id: (data as { id: string }).id, name: body.name },
    })
    return NextResponse.json({ key: data, secret: raw })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
