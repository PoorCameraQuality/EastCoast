import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import {
  formatBadgeShiftLine,
  registrationNumberFromIndex,
  type BadgePrintCategory,
  type BadgePrintRegistrant,
} from '@/lib/dancecard/badgePrint'
import { resolveBadgeLogoUrl } from '@/lib/dancecard/badgeLogoUrl'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

const PRINT_STATUSES = ['confirmed', 'checked_in'] as const

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const statusParam = request.nextUrl.searchParams.get('status')?.trim()
    const statuses =
      statusParam === 'checked_in'
        ? (['checked_in'] as const)
        : statusParam === 'confirmed'
          ? (['confirmed'] as const)
          : statusParam === 'all'
            ? null
            : PRINT_STATUSES

    let regQuery = admin
      .from('dancecard_registrants')
      .select(
        'id, scene_display_name, pronouns, badge_tagline, person_id, status, created_at, category_id, dancecard_registration_categories(name)',
      )
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (statuses) {
      regQuery = regQuery.in('status', [...statuses])
    } else if (statusParam === 'all') {
      regQuery = regQuery.neq('status', 'cancelled')
    } else {
      regQuery = regQuery.in('status', [...PRINT_STATUSES])
    }

    const { data: regRows, error: regErr } = await regQuery
    if (regErr) throw regErr

    const { data: shiftRows } = await admin
      .from('dancecard_staff_shifts')
      .select('person_id, person_name, role, starts_at, ends_at, shift_status')
      .eq('event_id', eventId)
      .in('shift_status', ['assigned', 'open', 'claimed'])
      .order('starts_at', { ascending: true })

    const tz = String(event.timezone ?? 'America/New_York')
    const shiftsByPerson = new Map<string, string[]>()
    const shiftsByName = new Map<string, string[]>()
    for (const s of shiftRows ?? []) {
      const line = formatBadgeShiftLine(
        String(s.starts_at),
        String(s.ends_at),
        String(s.role ?? ''),
        tz,
      )
      const pid = s.person_id as string | null
      if (pid) {
        const list = shiftsByPerson.get(pid) ?? []
        list.push(line)
        shiftsByPerson.set(pid, list)
      }
      const nameKey = String(s.person_name ?? '')
        .trim()
        .toLowerCase()
      if (nameKey) {
        const list = shiftsByName.get(nameKey) ?? []
        list.push(line)
        shiftsByName.set(nameKey, list)
      }
    }

    const registrants: BadgePrintRegistrant[] = (regRows ?? []).map((r, index) => {
      const cat = r.dancecard_registration_categories as { name?: string } | { name?: string }[] | null
      const packageName = Array.isArray(cat) ? cat[0]?.name : cat?.name
      const personId = (r.person_id as string | null) ?? null
      return {
        id: r.id as string,
        registrationNumber: registrationNumberFromIndex(index),
        sceneDisplayName: String(r.scene_display_name ?? ''),
        pronouns: (r.pronouns as string | null) ?? null,
        packageName: packageName ? String(packageName) : null,
        categoryId: (r.category_id as string | null) ?? null,
        badgeTagline: (r.badge_tagline as string | null) ?? null,
        shifts: personId
          ? (shiftsByPerson.get(personId) ?? [])
          : (shiftsByName.get(String(r.scene_display_name ?? '').trim().toLowerCase()) ?? []),
      }
    })

    const categoryCounts = new Map<string, { id: string; name: string; count: number }>()
    for (const r of registrants) {
      const id = r.categoryId ?? '__none__'
      const name = r.packageName ?? 'Uncategorized'
      const row = categoryCounts.get(id) ?? { id, name, count: 0 }
      row.count += 1
      categoryCounts.set(id, row)
    }
    const categories: BadgePrintCategory[] = Array.from(categoryCounts.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    )

    const badgeLogoUrl = await resolveBadgeLogoUrl(admin, event)

    return NextResponse.json({
      eventTitle: event.event_title,
      logoUrl: badgeLogoUrl,
      hasBadgeLogo: Boolean(event.badge_logo_path?.trim()),
      timezone: tz,
      categories,
      registrants,
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
