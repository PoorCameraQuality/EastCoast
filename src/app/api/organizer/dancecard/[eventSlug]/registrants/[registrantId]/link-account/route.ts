import { NextRequest, NextResponse } from 'next/server'
import { assertOrganizerCanMutate, organizerErrorResponse, requireOrganizerForSlug } from '@/lib/dancecard/organizerAuth'
import { mapOrganizerRegistrantRow } from '@/lib/dancecard/organizerRegistrantDto'
import { loadEventBySlugAnyStatus } from '@/lib/dancecard/routeCommon'

export const dynamic = 'force-dynamic'

/**
 * Links a registrant to a roster person by matching email (case-insensitive).
 */
export async function POST(
  _request: NextRequest,
  context: { params: { eventSlug: string; registrantId: string } },
) {
  try {
    const ctx = await requireOrganizerForSlug(context.params.eventSlug)
    assertOrganizerCanMutate(ctx)
    const { admin, eventId, organizerRole } = ctx
    const event = await loadEventBySlugAnyStatus(admin, context.params.eventSlug)
    if (!event || event.id !== eventId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const registrantId = context.params.registrantId
    const { data: reg, error: regErr } = await admin
      .from('dancecard_registrants')
      .select('id, email, person_id, scene_display_name, category_id')
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .maybeSingle()
    if (regErr) throw regErr
    if (!reg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const email = String(reg.email ?? '').trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Registrant has no email to match' }, { status: 400 })
    }

    const { data: persons, error: pErr } = await admin
      .from('dancecard_persons')
      .select('id, scene_name, email')
      .eq('event_id', eventId)
      .ilike('email', email)
    if (pErr) throw pErr

    const matches = (persons ?? []).filter((p) => String(p.email ?? '').trim().toLowerCase() === email)
    if (!matches.length) {
      return NextResponse.json({ error: 'No roster person found with this email' }, { status: 404 })
    }
    if (matches.length > 1) {
      return NextResponse.json({ error: 'Multiple roster people share this email — resolve in Directory first' }, { status: 409 })
    }

    const personId = matches[0].id as string
    const { data: row, error: upErr } = await admin
      .from('dancecard_registrants')
      .update({ person_id: personId, updated_at: new Date().toISOString() })
      .eq('id', registrantId)
      .eq('event_id', eventId)
      .select(
        'id, category_id, person_id, status, scene_display_name, legal_name, email, phone, internal_notes, vetting_status, vetting_safety_notes, pronouns, consent_waiver_ack_at, consent_photo_ack_at, imported_payment_status, external_source_ref, rabbitsign_status, created_at, updated_at',
      )
      .single()
    if (upErr) throw upErr

    const { data: cat } = await admin
      .from('dancecard_registration_categories')
      .select('name')
      .eq('id', row.category_id as string)
      .maybeSingle()

    return NextResponse.json({
      registrant: mapOrganizerRegistrantRow(row as Record<string, unknown>, (cat?.name as string) ?? null, organizerRole),
      linkedPerson: { id: personId, sceneName: matches[0].scene_name as string },
    })
  } catch (e) {
    return organizerErrorResponse(e)
  }
}
