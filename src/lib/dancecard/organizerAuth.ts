import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import type { OrganizerEventRole, OrganizerRoleForClient } from '@/lib/dancecard/organizerRoles'
import { getDancecardAdmin, normalizeEventSlug } from '@/lib/dancecard/routeCommon'
import { toClientError } from '@/lib/security/safeApiError'
import { assertProductionNoOrganizerBypass } from '@/lib/security/apiAuth'

export { assertProductionNoOrganizerBypass } from '@/lib/security/apiAuth'

/** Placeholder user id when `organizerDevBypassEnabled()` (API audit only; never in production). */
const DEV_BYPASS_USER_ID = '00000000-0000-4000-8000-000000000001'

/**
 * Local preview only: `next dev` + `.env.local` must set BOTH:
 *   DANCECARD_ORGANIZER_DEV_BYPASS=1
 * Unauthenticated access to organizer UI + APIs for any existing event slug.
 * Never enable in production (NODE_ENV must be `development`).
 */
export function organizerDevBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && process.env.DANCECARD_ORGANIZER_DEV_BYPASS === '1'
}

export async function isUserSiteAdmin(userId: string): Promise<boolean> {
  const admin = getDancecardAdmin()
  const { data, error } = await admin.from('profiles').select('role').eq('id', userId).maybeSingle()
  if (error || !data) return false
  return (data as { role?: string }).role === 'admin'
}

export function organizerErrorResponse(e: unknown): NextResponse {
  if (e instanceof Error) {
    if (e.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (e.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (e.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (e.message === 'EARLY_CHECK_IN') {
      const ex = e as Error & { eligibility?: string; validFrom?: string | null }
      return NextResponse.json(
        {
          error: 'This attendee is early for their ticket check-in window.',
          code: 'EARLY_CHECK_IN',
          eligibility: ex.eligibility ?? 'early',
          validFrom: ex.validFrom ?? null,
        },
        { status: 409 },
      )
    }
    if (e.message === 'BAD_REQUEST') {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 })
    }
    if (e.message.startsWith('BAD_REQUEST:')) {
      return NextResponse.json({ error: e.message.replace(/^BAD_REQUEST:\s*/, '') }, { status: 400 })
    }
  }
  const { status, body } = toClientError(e, 'organizer')
  return NextResponse.json(body, { status })
}

export function createSupabaseServerClientForOrganizer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  const cookieStore = cookies()
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // ignore when cookies are read-only (e.g. some static renders)
        }
      },
    },
  })
}

export async function getAuthedUserId(): Promise<string | null> {
  const supabase = createSupabaseServerClientForOrganizer()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.id) return null
  return user.id
}

function parseOrganizerRowRole(value: unknown): OrganizerEventRole {
  if (value === 'owner' || value === 'editor' || value === 'viewer' || value === 'safety') return value
  return 'editor'
}

export type OrganizerContext = {
  userId: string
  admin: SupabaseClient
  eventId: string
  slug: string
  /** For API responses / UI: site admin and dev bypass use `admin` (full owner powers). */
  organizerRole: OrganizerRoleForClient
}

export function assertOrganizerCanMutate(ctx: OrganizerContext) {
  if (ctx.organizerRole === 'viewer') {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}

export function assertOrganizerOwnerOrAdmin(ctx: OrganizerContext) {
  if (ctx.organizerRole !== 'owner' && ctx.organizerRole !== 'admin') {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}

/** Block viewer role from any organizer export (CSV/JSON download). */
export function assertOrganizerCanExport(ctx: OrganizerContext) {
  if (ctx.organizerRole === 'viewer') {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }
}

/** Block viewer role from CSV/JSON exports with full PII. */
export function assertOrganizerCanExportPii(ctx: OrganizerContext) {
  assertOrganizerCanExport(ctx)
}

export async function isUserOrganizerForSlug(userId: string, eventSlug: string): Promise<boolean> {
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)
  const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
  if (evErr || !ev) return false

  if (await isUserSiteAdmin(userId)) {
    return true
  }

  const { data: row, error } = await admin
    .from('dancecard_event_organizers')
    .select('id')
    .eq('event_id', (ev as { id: string }).id)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return false
  return Boolean(row)
}

/**
 * Organizer access for an event. Site admins and dev bypass get `organizerRole: 'admin'`.
 * Row owners/editors/viewers get their stored role.
 */
export async function requireOrganizerForSlug(eventSlug: string): Promise<OrganizerContext> {
  assertProductionNoOrganizerBypass()
  const admin = getDancecardAdmin()
  const slug = normalizeEventSlug(eventSlug)

  if (organizerDevBypassEnabled()) {
    const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
    if (evErr || !ev) {
      const err = new Error('NOT_FOUND')
      ;(err as Error & { status: number }).status = 404
      throw err
    }
    return { userId: DEV_BYPASS_USER_ID, admin, eventId: (ev as { id: string }).id, slug, organizerRole: 'admin' }
  }

  const userId = await getAuthedUserId()
  if (!userId) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }

  const { data: ev, error: evErr } = await admin.from('dancecard_events').select('id').eq('slug', slug).maybeSingle()
  if (evErr || !ev) {
    const err = new Error('NOT_FOUND')
    ;(err as Error & { status: number }).status = 404
    throw err
  }
  const eventId = (ev as { id: string }).id

  if (await isUserSiteAdmin(userId)) {
    return { userId, admin, eventId, slug, organizerRole: 'admin' }
  }

  const { data: orgRow, error: orgErr } = await admin
    .from('dancecard_event_organizers')
    .select('role')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .maybeSingle()
  if (orgErr || !orgRow) {
    const err = new Error('FORBIDDEN')
    ;(err as Error & { status: number }).status = 403
    throw err
  }

  return {
    userId,
    admin,
    eventId,
    slug,
    organizerRole: parseOrganizerRowRole((orgRow as { role?: string }).role),
  }
}

/** Row for organizer hub (/organizer/dancecard) and event switcher. */
export type OrganizerHubEventRow = {
  slug: string
  eventTitle: string
  productTitle: string
  status: string
  role: OrganizerRoleForClient
  updatedAt: string
  createdAt: string
  windowStartsAt: string
  windowEndsAt: string
  timezone: string
}

function hubRowFromEvent(
  e: {
    slug: string
    event_title: string
    product_title: string
    status: string
    created_at: string
    updated_at?: string | null
    window_starts_at: string
    window_ends_at: string
    timezone: string
  },
  role: OrganizerRoleForClient,
): OrganizerHubEventRow {
  const updatedAt = e.updated_at && e.updated_at.trim() !== '' ? e.updated_at : e.created_at
  return {
    slug: e.slug,
    eventTitle: e.event_title,
    productTitle: e.product_title,
    status: e.status,
    role,
    updatedAt,
    createdAt: e.created_at,
    windowStartsAt: e.window_starts_at,
    windowEndsAt: e.window_ends_at,
    timezone: e.timezone?.trim() || 'America/New_York',
  }
}

/**
 * Events visible in the organizer hub: all events for site admin; joined rows for normal users.
 * Dev bypass: lists every dancecard event (no auth).
 */
export async function listOrganizerHubEvents(userId: string | null): Promise<OrganizerHubEventRow[]> {
  assertProductionNoOrganizerBypass()
  const admin = getDancecardAdmin()
  if (organizerDevBypassEnabled()) {
    const { data, error } = await admin
      .from('dancecard_events')
      .select(
        'slug, event_title, product_title, status, created_at, updated_at, window_starts_at, window_ends_at, timezone',
      )
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) =>
      hubRowFromEvent(r as Parameters<typeof hubRowFromEvent>[0], 'admin'),
    )
  }
  if (!userId) {
    const err = new Error('UNAUTHORIZED')
    ;(err as Error & { status: number }).status = 401
    throw err
  }
  if (await isUserSiteAdmin(userId)) {
    const { data, error } = await admin
      .from('dancecard_events')
      .select(
        'slug, event_title, product_title, status, created_at, updated_at, window_starts_at, window_ends_at, timezone',
      )
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) =>
      hubRowFromEvent(r as Parameters<typeof hubRowFromEvent>[0], 'admin'),
    )
  }
  const { data: links, error: lErr } = await admin
    .from('dancecard_event_organizers')
    .select('event_id, role')
    .eq('user_id', userId)
  if (lErr) throw lErr
  const ids = (links ?? []).map((l) => (l as { event_id: string }).event_id).filter(Boolean)
  if (ids.length === 0) return []
  const { data: events, error: eErr } = await admin
    .from('dancecard_events')
    .select(
      'id, slug, event_title, product_title, status, created_at, updated_at, window_starts_at, window_ends_at, timezone',
    )
    .in('id', ids)
  if (eErr) throw eErr
  const roleByEvent = new Map<string, OrganizerEventRole>()
  for (const l of links ?? []) {
    const row = l as { event_id: string; role: string }
    roleByEvent.set(row.event_id, parseOrganizerRowRole(row.role))
  }
  const rows = (events ?? []).map((ev) => {
    const e = ev as Parameters<typeof hubRowFromEvent>[0] & { id: string }
    const role = roleByEvent.get(e.id) ?? 'editor'
    return hubRowFromEvent(e, role)
  })
  rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  return rows
}
