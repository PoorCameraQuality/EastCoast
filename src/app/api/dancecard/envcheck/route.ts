import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const AUDIT_TOKEN = 'paf26-env-audit-2026-04-22'

function decodeJwtPayload(jwt: string | undefined): Record<string, unknown> | null {
  if (!jwt) return null
  const parts = jwt.split('.')
  if (parts.length < 2) return null
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function keyShape(key: string | undefined): string {
  if (!key) return 'missing'
  if (key.startsWith('eyJ')) return 'legacy-jwt'
  if (key.startsWith('sb_secret_')) return 'new-sb_secret'
  if (key.startsWith('sb_publishable_')) return 'new-sb_publishable'
  return 'unknown-prefix:' + key.slice(0, 6)
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (token !== AUDIT_TOKEN) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const servicePayload = decodeJwtPayload(serviceKey)
  const anonPayload = decodeJwtPayload(anonKey)

  let supabaseProbe: Record<string, unknown> = { attempted: false }
  try {
    const admin = getSupabaseAdminClient()
    if (admin) {
      const { count } = await admin
        .from('dancecard_program_slots')
        .select('id', { count: 'exact', head: true })
      const { data: brynn } = await admin
        .from('dancecard_program_slots')
        .select('id, starts_at, ends_at')
        .ilike('title', '%BrynnEir%')
        .order('starts_at', { ascending: true })
        .limit(4)
      supabaseProbe = {
        attempted: true,
        totalSlots: count ?? null,
        brynnEirSlots: (brynn ?? []).map((s) => ({
          id: s.id,
          startsAt: s.starts_at,
          endsAt: s.ends_at,
        })),
      }
    } else {
      supabaseProbe = { attempted: true, error: 'admin client unavailable' }
    }
  } catch (e) {
    supabaseProbe = {
      attempted: true,
      error: e instanceof Error ? e.message : 'unknown',
    }
  }

  return NextResponse.json(
    {
      now: new Date().toISOString(),
      env: {
        NEXT_PUBLIC_SUPABASE_URL: url ?? null,
        serviceKey: {
          shape: keyShape(serviceKey),
          length: serviceKey?.length ?? 0,
          jwtPayloadRef: servicePayload?.ref ?? null,
          jwtPayloadRole: servicePayload?.role ?? null,
          jwtIat: servicePayload?.iat ?? null,
          jwtExp: servicePayload?.exp ?? null,
        },
        anonKey: {
          shape: keyShape(anonKey),
          length: anonKey?.length ?? 0,
          jwtPayloadRef: anonPayload?.ref ?? null,
          jwtPayloadRole: anonPayload?.role ?? null,
        },
      },
      supabaseProbe,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      deployEnv: process.env.VERCEL_ENV ?? null,
      region: process.env.VERCEL_REGION ?? null,
    },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  )
}
