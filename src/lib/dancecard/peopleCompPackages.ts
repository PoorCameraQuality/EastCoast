import type { SupabaseClient } from '@supabase/supabase-js'
import { isMissingColumn } from '@/lib/dancecard/supabaseColumnFallback'
import { roleKindMeta } from '@/lib/dancecard/registrationCategoryRoleKinds'

export type PersonCompPackage = {
  registrantId: string
  categoryId: string
  categoryName: string
  accessCode: string | null
  roleKind: string
  roleKindLabel: string
  expectedHours: number | null
}

function roleKindPriority(kind: string): number {
  switch (kind) {
    case 'staff':
    case 'volunteer':
      return 4
    case 'presenter':
    case 'photographer':
    case 'vendor':
      return 3
    case 'comp':
      return 2
    case 'other':
      return 1
    default:
      return 0
  }
}

function pickPreferred(
  current: PersonCompPackage | undefined,
  next: PersonCompPackage,
): PersonCompPackage {
  if (!current) return next
  const curP = roleKindPriority(current.roleKind)
  const nextP = roleKindPriority(next.roleKind)
  if (nextP > curP) return next
  if (nextP < curP) return current
  return next
}

function mapCategoryRow(c: Record<string, unknown>) {
  const roleKind = String(c.role_kind ?? 'attendee')
  const rawHours = c.expected_hours
  const accessCode = c.access_code != null ? String(c.access_code).trim() || null : null
  return {
    categoryName: String(c.name ?? ''),
    accessCode,
    roleKind,
    roleKindLabel: roleKindMeta(roleKind).label,
    expectedHours:
      rawHours === null || rawHours === undefined ? null : Number(rawHours),
  }
}

/** Registration comp package (category role + service hours) per roster person, via linked registrant. */
export async function loadPeopleCompPackages(
  admin: SupabaseClient,
  eventId: string,
  people: { id: string; email: string | null }[],
): Promise<Record<string, PersonCompPackage>> {
  const emailToPersonId = new Map<string, string>()
  for (const p of people) {
    if (p.email) emailToPersonId.set(p.email.trim().toLowerCase(), p.id)
  }

  const { data: regs, error: regErr } = await admin
    .from('dancecard_registrants')
    .select('id, person_id, email, category_id')
    .eq('event_id', eventId)
  if (regErr) throw regErr

  const catIds = Array.from(new Set((regs ?? []).map((r) => r.category_id as string).filter(Boolean)))
  const catById = new Map<string, ReturnType<typeof mapCategoryRow>>()

  if (catIds.length) {
    const fullQuery = await admin
      .from('dancecard_registration_categories')
      .select('id, name, access_code, role_kind, expected_hours')
      .in('id', catIds)

    let categoryRows: Record<string, unknown>[] = []
    if (fullQuery.error && isMissingColumn(fullQuery.error)) {
      const slimQuery = await admin
        .from('dancecard_registration_categories')
        .select('id, name, access_code')
        .in('id', catIds)
      if (slimQuery.error) throw slimQuery.error
      categoryRows = (slimQuery.data ?? []) as Record<string, unknown>[]
    } else {
      if (fullQuery.error) throw fullQuery.error
      categoryRows = (fullQuery.data ?? []) as Record<string, unknown>[]
    }

    for (const row of categoryRows) {
      catById.set(row.id as string, mapCategoryRow(row))
    }
  }

  const out: Record<string, PersonCompPackage> = {}

  for (const r of regs ?? []) {
    const categoryId = r.category_id as string
    const cat = catById.get(categoryId)
    if (!cat) continue

    let personId = (r.person_id as string | null) ?? null
    if (!personId) {
      const em = (r.email as string | null)?.trim().toLowerCase()
      if (em) personId = emailToPersonId.get(em) ?? null
    }
    if (!personId) continue

    const pkg: PersonCompPackage = {
      registrantId: r.id as string,
      categoryId,
      categoryName: cat.categoryName,
      accessCode: cat.accessCode,
      roleKind: cat.roleKind,
      roleKindLabel: cat.roleKindLabel,
      expectedHours: cat.expectedHours,
    }
    out[personId] = pickPreferred(out[personId], pkg)
  }

  return out
}

export function formatServiceHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return '—'
  const h = Number(hours)
  if (h <= 0) return 'None required'
  return `${h} hr${h === 1 ? '' : 's'}`
}
