import type { SupabaseClient } from '@supabase/supabase-js'
import { codesEqual } from '@/lib/dancecard/accessCodes'

export type ResolvedRegistrationCategory = {
  categoryId: string
  categoryName: string
  roleKind: string
  grantsStaffAccess: boolean
}

type CategoryRow = {
  id: string
  name: string
  role_kind: string | null
  access_code: string | null
  grants_staff_access: boolean | null
  sort_order: number | null
}

function sortCategories(rows: CategoryRow[]): CategoryRow[] {
  return [...rows].sort((a, b) => {
    const ao = Number(a.sort_order ?? 0)
    const bo = Number(b.sort_order ?? 0)
    if (ao !== bo) return ao - bo
    return String(a.name).localeCompare(String(b.name))
  })
}

function mapRow(row: CategoryRow): ResolvedRegistrationCategory {
  return {
    categoryId: row.id,
    categoryName: String(row.name),
    roleKind: String(row.role_kind ?? 'attendee'),
    grantsStaffAccess: Boolean(row.grants_staff_access),
  }
}

function pickDefaultAttendeeCategory(rows: CategoryRow[]): CategoryRow | null {
  const sorted = sortCategories(rows)
  return (
    sorted.find(
      (c) =>
        String(c.role_kind ?? 'attendee') === 'attendee' && !String(c.access_code ?? '').trim(),
    ) ?? null
  )
}

/**
 * Maps an optional comp / registration code to a ticket category.
 * Empty code → default attendee-type category (no code required).
 */
export async function resolveRegistrationCategoryFromCompCode(
  admin: SupabaseClient,
  eventId: string,
  compCode?: string | null,
): Promise<ResolvedRegistrationCategory> {
  const { data: rows, error } = await admin
    .from('dancecard_registration_categories')
    .select('id, name, role_kind, access_code, grants_staff_access, sort_order')
    .eq('event_id', eventId)
  if (error) throw error
  if (!rows?.length) {
    throw new Error('BAD_REQUEST: This event has no registration categories configured')
  }

  const code = String(compCode ?? '').trim()
  if (!code) {
    const picked = pickDefaultAttendeeCategory(rows as CategoryRow[])
    if (!picked) {
      throw new Error(
        'BAD_REQUEST: No open attendee registration type is available. Enter a registration code or contact the organizers.',
      )
    }
    return mapRow(picked)
  }

  const matches = sortCategories(rows as CategoryRow[]).filter((c) => {
    const stored = String(c.access_code ?? '').trim()
    return stored.length > 0 && codesEqual(code, stored)
  })
  if (!matches.length) {
    throw new Error('BAD_REQUEST: Invalid or unrecognized registration code')
  }
  return mapRow(matches[0]!)
}
