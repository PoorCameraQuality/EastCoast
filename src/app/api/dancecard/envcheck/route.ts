import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { loadEventBySlug, normalizeEventSlug, getDancecardAdmin } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  const probes: Record<string, unknown> = {}

  try {
    const admin = getSupabaseAdminClient()
    if (admin) {
      const { count } = await admin
        .from('dancecard_program_slots')
        .select('id', { count: 'exact', head: true })
      const { data: brynn } = await admin
        .from('dancecard_program_slots')
        .select('id, starts_at, title')
        .ilike('title', '%BrynnEir%')
        .order('starts_at', { ascending: true })
        .limit(4)
      probes.pathA_generic = { totalSlots: count, brynn }
    }
  } catch (e) {
    probes.pathA_generic = { error: e instanceof Error ? e.message : 'x' }
  }

  try {
    const admin = getDancecardAdmin()
    const slug = normalizeEventSlug('paf26')
    const event = await loadEventBySlug(admin, slug)
    if (!event) {
      probes.pathB_schedule = { error: 'event not found' }
    } else {
      const { data: slots } = await admin
        .from('dancecard_program_slots')
        .select('id, starts_at, ends_at, title, track, room, description, sort_order')
        .eq('event_id', event.id)
        .ilike('title', '%BrynnEir%')
        .order('starts_at', { ascending: true })
        .order('sort_order', { ascending: true })
      probes.pathB_schedule = {
        eventId: event.id,
        eventSlug: event.slug,
        brynnCount: slots?.length ?? 0,
        brynn: slots,
      }
    }
  } catch (e) {
    probes.pathB_schedule = { error: e instanceof Error ? e.message : 'x' }
  }

  try {
    const restUrl =
      (url ?? '') +
      "/rest/v1/dancecard_program_slots?select=id,starts_at,ends_at,title&title=ilike.%25BrynnEir%25&order=starts_at.asc"
    const r = await fetch(restUrl, {
      headers: {
        apikey: serviceKey ?? '',
        Authorization: 'Bearer ' + (serviceKey ?? ''),
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    probes.pathC_rawRest = {
      status: r.status,
      body: r.ok ? await r.json() : await r.text(),
    }
  } catch (e) {
    probes.pathC_rawRest = { error: e instanceof Error ? e.message : 'x' }
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
      probes,
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      deployEnv: process.env.VERCEL_ENV ?? null,
      region: process.env.VERCEL_REGION ?? null,
    },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } },
  )
}
