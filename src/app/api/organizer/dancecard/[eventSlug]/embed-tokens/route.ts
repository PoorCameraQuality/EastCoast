import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { z } from 'zod'
import { hashApiKey, mintEmbedTokenRaw } from '@/lib/dancecard/externalApiAuth'
import {
  assertOrganizerOwnerOrAdmin,
  organizerErrorResponse,
  requireOrganizerForSlug,
} from '@/lib/dancecard/organizerAuth'
import { isAllowedOrigin } from '@/lib/security/safeOrigin'

export const dynamic = 'force-dynamic'

const postSchema = z.object({
  embedKind: z.enum(['schedule', 'map', 'ops_summary']),
  label: z.string().max(200).optional(),
  allowedOrigins: z.array(z.string().max(500)).max(32).optional(),
})

function validateAllowedOrigins(origins: string[] | undefined): string[] | null {
  const list = (origins ?? []).map((o) => o.trim()).filter(Boolean)
  if (process.env.NODE_ENV === 'production' && list.length === 0) {
    const err = new Error('BAD_REQUEST: allowedOrigins required in production')
    throw err
  }
  for (const o of list) {
    try {
      const u = new URL(o.includes('://') ? o : `https://${o}`)
      if (!isAllowedOrigin(u.origin, [u.origin])) {
        const err = new Error(`BAD_REQUEST: invalid origin ${o}`)
        throw err
      }
    } catch (e) {
      if (e instanceof Error && e.message.startsWith('BAD_REQUEST:')) throw e
      const err = new Error(`BAD_REQUEST: invalid origin ${o}`)
      throw err
    }
  }
  return list.length ? list : null
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const { data, error } = await ctx.admin
      .from('dancecard_embed_tokens')
      .select('id, embed_kind, label, allowed_origins, created_at, revoked_at')
      .eq('event_id', ctx.eventId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) {
      if (/dancecard_embed_tokens|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ tokens: [], needsMigration: true })
      }
      throw error
    }
    return NextResponse.json({
      tokens: (data ?? [])
        .filter((r) => !(r as { revoked_at?: string | null }).revoked_at)
        .map((r) => ({
          id: r.id as string,
          embedKind: r.embed_kind as string,
          label: (r.label as string | null) ?? null,
          allowedOrigins: (r.allowed_origins as string[] | null) ?? null,
          createdAt: r.created_at as string,
        })),
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}

export async function POST(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerOwnerOrAdmin(ctx)
    const body = postSchema.parse(await request.json())
    const allowedOrigins = validateAllowedOrigins(body.allowedOrigins)
    const raw = mintEmbedTokenRaw()
    const hash = hashApiKey(raw)
    const { data: row, error } = await ctx.admin
      .from('dancecard_embed_tokens')
      .insert({
        event_id: ctx.eventId,
        embed_kind: body.embedKind,
        token_hash: hash,
        label: body.label ?? null,
        allowed_origins: allowedOrigins,
        created_by_user_id: ctx.userId,
      })
      .select('id, embed_kind, label, allowed_origins, created_at')
      .single()
    if (error) {
      if (/dancecard_embed_tokens|42P01|does not exist/i.test(error.message)) {
        return NextResponse.json({ error: 'Apply migration dancecard_027_phase7_embed_entitlements.sql first.' }, { status: 409 })
      }
      throw error
    }
    return NextResponse.json({
      token: raw,
      record: {
        id: row.id as string,
        embedKind: row.embed_kind as string,
        label: (row.label as string | null) ?? null,
        allowedOrigins: (row.allowed_origins as string[] | null) ?? null,
        createdAt: row.created_at as string,
      },
    })
  } catch (e) {
    if (e instanceof ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.flatten() }, { status: 400 })
    }
    if (e instanceof Error && e.message.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: e.message.replace(/^BAD_REQUEST:\s*/, '') }, { status: 400 })
    }
    return organizerErrorResponse(e)
  }
}
