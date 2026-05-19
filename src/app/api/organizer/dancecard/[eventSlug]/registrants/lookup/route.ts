import { NextRequest, NextResponse } from 'next/server'
import { organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { mapOrganizerRegistrantRow } from '@/lib/dancecard/organizerRegistrantDto'
import { registrantCheckInExtras } from '@/lib/dancecard/organizerRegistrantCheckIn'
import { verifyCheckInQrPayload } from '@/lib/dancecard/checkInToken'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, context: { params: { eventSlug: string } }) {
  try {
    const { admin, eventId, organizerRole } = await requireOrganizerForSlug(context.params.eventSlug)
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
    const token = request.nextUrl.searchParams.get('token')?.trim() ?? ''
    const qr = request.nextUrl.searchParams.get('qr')?.trim() ?? ''

    let registrantId: string | null = null
    let checkInToken: string | null = null

    if (qr) {
      const parsed = verifyCheckInQrPayload(qr)
      if (!parsed) return NextResponse.json({ error: 'Invalid QR code' }, { status: 400 })
      registrantId = parsed.registrantId
      checkInToken = parsed.token
    } else if (token) {
      const { data } = await admin
        .from('dancecard_registrants')
        .select('id, check_in_token')
        .eq('event_id', eventId)
        .eq('check_in_token', token)
        .maybeSingle()
      if (!data) return NextResponse.json({ registrants: [] })
      registrantId = data.id as string
    }

    if (registrantId && checkInToken) {
      const { data: row, error } = await admin
        .from('dancecard_registrants')
        .select(
          'id, category_id, person_id, status, scene_display_name, legal_name, email, pronouns, vetting_status, checked_in_at, checked_in_timing, check_in_token, consent_waiver_ack_at, consent_photo_ack_at',
        )
        .eq('id', registrantId)
        .eq('event_id', eventId)
        .maybeSingle()
      if (error) throw error
      if (!row || (row.check_in_token as string | null) !== checkInToken) {
        return NextResponse.json({ error: 'Registrant not found' }, { status: 404 })
      }
      const { data: cat } = await admin
        .from('dancecard_registration_categories')
        .select('name, check_in_valid_from, check_in_valid_through')
        .eq('id', row.category_id as string)
        .maybeSingle()
      const extras = registrantCheckInExtras({
        status: row.status as string,
        checkedInAt: (row.checked_in_at as string | null) ?? null,
        checkedInTiming: (row.checked_in_timing as string | null) ?? null,
        category: cat ?? null,
        event,
      })
      return NextResponse.json({
        registrants: [
          mapOrganizerRegistrantRow(row as Record<string, unknown>, (cat?.name as string) ?? null, organizerRole, extras),
        ],
      })
    }

    if (!q || q.length < 2) {
      return NextResponse.json({ registrants: [] })
    }

    const safe = q.replace(/%/g, '').replace(/_/g, '').replace(/,/g, '')
    const { data: rows, error } = await admin
      .from('dancecard_registrants')
      .select(
        'id, category_id, person_id, status, scene_display_name, legal_name, email, pronouns, vetting_status, checked_in_at, checked_in_timing, consent_waiver_ack_at, consent_photo_ack_at',
      )
      .eq('event_id', eventId)
      .neq('status', 'cancelled')
      .or(`scene_display_name.ilike.%${safe}%,email.ilike.%${safe}%,legal_name.ilike.%${safe}%`)
      .order('scene_display_name', { ascending: true })
      .limit(12)
    if (error) throw error

    const catIds = Array.from(new Set((rows ?? []).map((r) => r.category_id as string)))
    const { data: cats } = await admin
      .from('dancecard_registration_categories')
      .select('id, name, check_in_valid_from, check_in_valid_through')
      .in('id', catIds.length ? catIds : ['00000000-0000-4000-8000-000000000000'])
    const catById = new Map((cats ?? []).map((c) => [c.id as string, c]))

    const registrants = (rows ?? []).map((r) => {
      const cat = catById.get(r.category_id as string)
      const extras = registrantCheckInExtras({
        status: r.status as string,
        checkedInAt: (r.checked_in_at as string | null) ?? null,
        checkedInTiming: (r.checked_in_timing as string | null) ?? null,
        category: cat ?? null,
        event,
      })
      return mapOrganizerRegistrantRow(r as Record<string, unknown>, (cat?.name as string) ?? null, organizerRole, extras)
    })

    return NextResponse.json({ registrants })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
