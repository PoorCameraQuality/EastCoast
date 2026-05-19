import { NextRequest, NextResponse } from 'next/server'
import { requireOrganizerForSlug, organizerErrorResponse } from '@/lib/dancecard/organizerAuth'
import { DANCECARD_ACCOUNT_REGISTRANT_SOURCE } from '@/lib/dancecard/ensureSelfServiceRegistrant'

export const dynamic = 'force-dynamic'

function shiftHours(startsAt: string, endsAt: string): number {
  const ms = new Date(endsAt).getTime() - new Date(startsAt).getTime()
  return ms > 0 ? ms / 3_600_000 : 0
}

export async function GET(_request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId } = await requireOrganizerForSlug(context.params.eventSlug)

    const { data: categories, error: cErr } = await admin
      .from('dancecard_registration_categories')
      .select('id, name, expected_hours')
      .eq('event_id', eventId)
      .gt('expected_hours', 0)
    if (cErr) throw cErr
    const catById = new Map((categories ?? []).map((c) => [c.id as string, c]))

    const { data: registrants, error: rErr } = await admin
      .from('dancecard_registrants')
      .select('id, scene_display_name, category_id, external_id, external_source, status')
      .eq('event_id', eventId)
      .neq('status', 'cancelled')
    if (rErr) throw rErr

    const accountIds = (registrants ?? [])
      .filter(
        (r) =>
          r.external_source === DANCECARD_ACCOUNT_REGISTRANT_SOURCE &&
          r.external_id &&
          r.category_id &&
          catById.has(r.category_id as string),
      )
      .map((r) => r.external_id as string)

    const hoursByAccount = new Map<string, number>()
    if (accountIds.length) {
      const { data: shifts, error: sErr } = await admin
        .from('dancecard_staff_shifts')
        .select('claimed_by_account_id, starts_at, ends_at, shift_status')
        .eq('event_id', eventId)
        .in('claimed_by_account_id', accountIds)
        .neq('shift_status', 'dropped')
      if (sErr) throw sErr
      for (const sh of shifts ?? []) {
        const aid = sh.claimed_by_account_id as string | null
        if (!aid) continue
        hoursByAccount.set(aid, (hoursByAccount.get(aid) ?? 0) + shiftHours(String(sh.starts_at), String(sh.ends_at)))
      }
    }

    const rows = (registrants ?? [])
      .map((r) => {
        const cat = r.category_id ? catById.get(r.category_id as string) : null
        if (!cat) return null
        const expected = Number(cat.expected_hours ?? 0)
        if (expected <= 0) return null
        const accountId =
          r.external_source === DANCECARD_ACCOUNT_REGISTRANT_SOURCE ? (r.external_id as string | null) : null
        const claimed = accountId ? (hoursByAccount.get(accountId) ?? 0) : 0
        const deficit = Math.max(0, expected - claimed)
        return {
          registrantId: r.id as string,
          displayName: String(r.scene_display_name ?? ''),
          categoryName: String(cat.name ?? ''),
          expectedHours: expected,
          claimedHours: Math.round(claimed * 10) / 10,
          deficitHours: Math.round(deficit * 10) / 10,
        }
      })
      .filter(Boolean)
      .filter((row) => row!.deficitHours > 0)
      .sort((a, b) => b!.deficitHours - a!.deficitHours)

    return NextResponse.json({ rows })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
