import { z } from 'zod'
import { slugifyOrgName } from '@/lib/authUtils'
import { EAST_COAST_STATES } from '@/lib/eastCoastStates'
import { requireOrgSession, type OwnedOrganization } from '@/lib/eckeOrgAuth'
import { BASE_URL } from '@/lib/seo'
import { submitSingleContentUrlToIndexNow } from '@/lib/indexnow'
import { getSupabaseAdminClient } from '@/lib/supabaseAdmin'

export const ORG_EVENT_KINDS = [
  'convention',
  'munch',
  'play_party',
  'class',
  'social',
  'virtual',
] as const

export type OrgEventKind = (typeof ORG_EVENT_KINDS)[number]

export const ORG_EVENT_KIND_LABELS: Record<OrgEventKind, string> = {
  convention: 'Convention / weekend',
  munch: 'Munch',
  play_party: 'Play party',
  class: 'Class / workshop',
  social: 'Social / mixer',
  virtual: 'Virtual / online',
}

const KIND_CATEGORY: Record<OrgEventKind, string> = {
  convention: 'Convention',
  munch: 'Munch',
  play_party: 'Play party',
  class: 'Class',
  social: 'Social',
  virtual: 'Virtual event',
}

const KIND_TAGS: Record<OrgEventKind, string[]> = {
  convention: ['convention'],
  munch: ['munch'],
  play_party: ['play-party'],
  class: ['classes'],
  social: ['bdsm-social'],
  virtual: ['virtual'],
}

export const STATE_ABBR_OPTIONS = Object.values(EAST_COAST_STATES)
  .map((state) => ({ abbr: state.abbr, name: state.name }))
  .filter((row, index, all) => all.findIndex((item) => item.abbr === row.abbr) === index)
  .sort((a, b) => a.name.localeCompare(b.name))

function optionalUrl(value: string | undefined): string | undefined {
  const raw = (value ?? '').trim()
  if (!raw) return undefined
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
}

export const orgEventSchema = z
  .object({
    title: z.string().min(3).max(120),
    kind: z.enum(ORG_EVENT_KINDS),
    startDate: z.string().min(8),
    endDate: z.string().min(8),
    city: z.string().max(80).optional().or(z.literal('')),
    state: z.string().max(2).optional().or(z.literal('')),
    venue: z.string().max(120).optional().or(z.literal('')),
    shortDescription: z.string().min(10).max(280),
    longDescription: z.string().min(10).max(4000),
    website: z.string().max(500).optional().or(z.literal('')),
  })
  .superRefine((value, ctx) => {
    if (value.kind !== 'virtual') {
      if (!value.city?.trim()) ctx.addIssue({ code: 'custom', path: ['city'], message: 'City is required' })
      if (!value.state?.trim() || value.state.trim().length !== 2) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'State is required' })
      }
    }
    if (value.endDate < value.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'End date must be on or after the start date' })
    }
  })

export const orgDungeonSchema = z.object({
  name: z.string().min(2).max(120),
  city: z.string().min(2).max(80),
  state: z.string().length(2),
  description: z.string().min(10).max(4000),
  website: z.string().max(500).optional().or(z.literal('')),
})

export type OrgEventInput = z.infer<typeof orgEventSchema>
export type OrgDungeonInput = z.infer<typeof orgDungeonSchema>

export type OrgEventRow = {
  id: string
  title: string
  slug: string
  start_date: string
  end_date: string
  city: string
  state: string
  venue: string | null
  category: string | null
  event_type: string | null
  short_description: string | null
  long_description: string | null
  website: string | null
  status: string | null
}

export type OrgDungeonRow = {
  id: string
  name: string
  slug: string
  city: string | null
  state: string | null
  description: string | null
  website_url: string | null
}

export async function requireOrgApiSession() {
  const session = await requireOrgSession()
  if (!session) return { error: 'Unauthorized', status: 401 as const, session: null }
  const admin = getSupabaseAdminClient()
  if (!admin) return { error: 'Database not configured', status: 500 as const, session: null }
  return { error: null, status: 200 as const, session, admin }
}

export async function uniqueListingSlug(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  table: 'events' | 'dungeon_venues',
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugifyOrgName(base) || 'listing'
  for (let i = 0; i < 8; i += 1) {
    const candidate = i === 0 ? root : `${root}-${i + 1}`
    let query = admin.from(table).select('id').eq('slug', candidate)
    if (excludeId) query = query.neq('id', excludeId)
    const { data } = await query.maybeSingle()
    if (!data) return candidate
  }
  return `${root}-${Date.now().toString(36)}`
}

export function eventRowFromInput(input: OrgEventInput, org: OwnedOrganization, slug: string) {
  const virtual = input.kind === 'virtual'
  const city = virtual ? 'Online' : input.city!.trim()
  const state = virtual ? 'US' : input.state!.trim().toUpperCase()
  const website = optionalUrl(input.website) ?? null
  return {
    title: input.title.trim(),
    slug,
    start_date: input.startDate,
    end_date: input.endDate,
    display_date: `${input.startDate} – ${input.endDate}`,
    city,
    state,
    venue: virtual ? input.venue?.trim() || 'Online' : input.venue?.trim() || null,
    short_description: input.shortDescription.trim(),
    long_description: input.longDescription.trim(),
    category: KIND_CATEGORY[input.kind],
    event_type: input.kind,
    tags: KIND_TAGS[input.kind],
    website,
    organizer: org.name,
    organizer_name: org.name,
    email: org.email,
    organization_id: org.id,
    status: 'published',
    published_at: new Date().toISOString(),
    seo_description: input.shortDescription.trim().slice(0, 160),
  }
}

export function dungeonRowFromInput(input: OrgDungeonInput, org: OwnedOrganization, slug: string) {
  return {
    name: input.name.trim(),
    slug,
    city: input.city.trim(),
    state: input.state.trim().toUpperCase(),
    description: input.description.trim(),
    website_url: optionalUrl(input.website) ?? null,
    organization_id: org.id,
    meta_title: `${input.name.trim()} | East Coast Kink Events`,
    meta_description: input.description.trim().slice(0, 160),
  }
}

export function notifyListingIndex(path: string) {
  void submitSingleContentUrlToIndexNow(`${BASE_URL}${path}`)
}

export async function listOrgEvents(orgId: string): Promise<OrgEventRow[]> {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data, error } = await admin
    .from('events')
    .select(
      'id, title, slug, start_date, end_date, city, state, venue, category, event_type, short_description, long_description, website, status',
    )
    .eq('organization_id', orgId)
    .order('start_date', { ascending: false })
  if (error || !data) return []
  return data as OrgEventRow[]
}

export async function listOrgDungeons(orgId: string): Promise<OrgDungeonRow[]> {
  const admin = getSupabaseAdminClient()
  if (!admin) return []
  const { data, error } = await admin
    .from('dungeon_venues')
    .select('id, name, slug, city, state, description, website_url')
    .eq('organization_id', orgId)
    .order('name')
  if (error || !data) return []
  return data as OrgDungeonRow[]
}

export async function getOwnedEvent(orgId: string, id: string): Promise<OrgEventRow | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from('events')
    .select(
      'id, title, slug, start_date, end_date, city, state, venue, category, event_type, short_description, long_description, website, status',
    )
    .eq('organization_id', orgId)
    .eq('id', id)
    .maybeSingle()
  return (data as OrgEventRow | null) ?? null
}

export async function getOwnedDungeon(orgId: string, id: string): Promise<OrgDungeonRow | null> {
  const admin = getSupabaseAdminClient()
  if (!admin) return null
  const { data } = await admin
    .from('dungeon_venues')
    .select('id, name, slug, city, state, description, website_url')
    .eq('organization_id', orgId)
    .eq('id', id)
    .maybeSingle()
  return (data as OrgDungeonRow | null) ?? null
}

export async function orgOwnsEventSlug(orgId: string, slug: string): Promise<boolean> {
  const admin = getSupabaseAdminClient()
  if (!admin) return false
  const { data } = await admin.from('events').select('id').eq('organization_id', orgId).eq('slug', slug).maybeSingle()
  return Boolean(data)
}

export async function orgOwnsDungeonSlug(orgId: string, slug: string): Promise<boolean> {
  const admin = getSupabaseAdminClient()
  if (!admin) return false
  const { data } = await admin
    .from('dungeon_venues')
    .select('id')
    .eq('organization_id', orgId)
    .eq('slug', slug)
    .maybeSingle()
  return Boolean(data)
}
